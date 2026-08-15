import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Resolves short links and normalizes Google Form URL to /viewform
 */
function normalizeFormUrl(inputUrl) {
  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  // Convert /formResponse or /closedform or /edit to /viewform if applicable
  if (url.includes('docs.google.com/forms')) {
    url = url.replace(/\/formResponse.*/, '/viewform')
             .replace(/\/closedform.*/, '/viewform')
             .replace(/\/edit.*/, '/viewform');
  }
  return url;
}

/**
 * Parses Google Form HTML to extract FB_PUBLIC_LOAD_DATA_
 */
function parseFormSchema(html, formUrl) {
  const $ = cheerio.load(html);
  
  // Extract Form Title from og:title or title tag or HTML
  let formTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Google Form';
  formTitle = formTitle.replace(' - Google Forms', '').replace(' - Google Docs', '').trim();

  let formDescription = $('meta[property="og:description"]').attr('content') || '';

  // Extract FB_PUBLIC_LOAD_DATA_
  let scriptContent = '';
  $('script').each((i, el) => {
    const text = $(el).html() || '';
    if (text.includes('FB_PUBLIC_LOAD_DATA_')) {
      scriptContent = text;
    }
  });

  if (!scriptContent) {
    throw new Error('Could not find Google Form data in page source. Please make sure the form is public and accessible.');
  }

  // Extract JSON string from `var FB_PUBLIC_LOAD_DATA_ = [...]`
  const match = scriptContent.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);\s*<\/script>|FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);/);
  if (!match) {
    throw new Error('Failed to extract form data JSON payload.');
  }

  const jsonStr = match[1] || match[2];
  let rawData;
  try {
    rawData = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error('Failed to parse form schema structure JSON.');
  }

  // Extract Form ID
  let formId = '';
  const idMatch = formUrl.match(/\/d\/e\/([^\/]+)/);
  if (idMatch) {
    formId = idMatch[1];
  } else if (rawData[14]) {
    formId = rawData[14];
  }

  const submitUrl = formId 
    ? `https://docs.google.com/forms/d/e/${formId}/formResponse`
    : formUrl.replace('/viewform', '/formResponse');

  // Form description from rawData if available
  if (rawData[1] && rawData[1][0]) {
    formTitle = rawData[1][0] || formTitle;
  }
  if (rawData[1] && rawData[1][1]) {
    formDescription = rawData[1][1] || formDescription;
  }

  // Extract Items
  const items = rawData[1] && rawData[1][1] ? rawData[1][1] : [];
  const fields = [];

  items.forEach((item, idx) => {
    if (!item) return;
    const itemId = item[0];
    const title = item[1] || `Field ${idx + 1}`;
    const description = item[2] || '';
    const typeCode = item[3];
    const details = item[4];

    if (!details || !details.length) return;

    details.forEach((det) => {
      if (!det) return;
      const entryNum = det[0];
      if (!entryNum) return;

      const entryId = `entry.${entryNum}`;
      const isRequired = det[2] === 1;
      
      // Parse Options / Choices
      const rawChoices = det[1] || [];
      const choices = rawChoices.map(c => Array.isArray(c) ? c[0] : c).filter(Boolean);

      // Map Type Code
      let type = 'short_text';
      switch (typeCode) {
        case 0: type = 'short_text'; break;
        case 1: type = 'paragraph'; break;
        case 2: type = 'radio'; break;
        case 3: type = 'dropdown'; break;
        case 4: type = 'checkbox'; break;
        case 5: type = 'scale'; break;
        case 7: type = 'date'; break;
        case 8: type = 'time'; break;
        default: type = 'short_text'; break;
      }

      fields.push({
        id: itemId,
        entryId: entryId,
        title: title,
        description: description,
        type: type,
        typeCode: typeCode,
        required: isRequired,
        choices: choices
      });
    });
  });

  return {
    formTitle,
    formDescription,
    formUrl,
    submitUrl,
    formId,
    fields
  };
}

// API Endpoint to parse a Google Form URL
app.post('/api/parse-form', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Form URL is required.' });
    }

    const normalizedUrl = normalizeFormUrl(url);

    // Fetch the page with user-agent header
    const response = await axios.get(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      maxRedirects: 5
    });

    const finalUrl = response.request.res.responseUrl || normalizedUrl;
    const schema = parseFormSchema(response.data, finalUrl);

    return res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    console.error('Error parsing form:', error.message);
    return res.json({
      success: false,
      error: error.message || 'Failed to parse Google Form. Ensure the form link is public.'
    });
  }
});

// API Endpoint to submit form responses
app.post('/api/submit-form', async (req, res) => {
  try {
    const { submitUrl, payload } = req.body;
    if (!submitUrl || !payload) {
      return res.status(400).json({ success: false, error: 'submitUrl and payload are required.' });
    }

    // Convert payload object to URL Search Params (form-urlencoded)
    const params = new URLSearchParams();
    
    Object.keys(payload).forEach(key => {
      const value = payload[key];
      if (Array.isArray(value)) {
        value.forEach(val => params.append(key, val));
      } else if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    // Send POST request to Google Form formResponse endpoint
    const response = await axios.post(submitUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      validateStatus: () => true // Handle 200, 302, etc.
    });

    // Google Forms usually return 200 OK with a confirmation page HTML upon success
    const isSuccess = response.status === 200 && (
      response.data.includes('Your response has been recorded') ||
      response.data.includes('freebirdFormviewerViewResponseConfirmationText') ||
      !response.data.includes('freebirdFormviewerViewHeaderRequiredLegend')
    );

    return res.json({
      success: true,
      statusCode: response.status,
      isSuccessRecorded: isSuccess,
      message: isSuccess ? 'Form successfully submitted to Google!' : 'Submitted (Status ' + response.status + ')'
    });
  } catch (error) {
    console.error('Error submitting form:', error.message);
    return res.json({
      success: false,
      error: error.message || 'Failed to submit Google Form'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
