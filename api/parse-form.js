import axios from 'axios';
import * as cheerio from 'cheerio';

function normalizeFormUrl(inputUrl) {
  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  if (url.includes('docs.google.com/forms')) {
    url = url.replace(/\/formResponse.*/, '/viewform')
             .replace(/\/closedform.*/, '/viewform')
             .replace(/\/edit.*/, '/viewform');
  }
  return url;
}

function parseFormSchema(html, formUrl) {
  const $ = cheerio.load(html);
  
  let formTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Google Form';
  formTitle = formTitle.replace(' - Google Forms', '').replace(' - Google Docs', '').trim();

  let formDescription = $('meta[property="og:description"]').attr('content') || '';

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

  const match = scriptContent.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);\s*<\/script>|FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);/);
  if (!match) {
    throw new Error('Failed to extract form data JSON payload.');
  }

  const jsonStr = match[1] || match[2];
  const rawData = JSON.parse(jsonStr);

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

  if (rawData[1] && rawData[1][0]) {
    formTitle = rawData[1][0] || formTitle;
  }
  if (rawData[1] && rawData[1][1]) {
    formDescription = rawData[1][1] || formDescription;
  }

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
      
      const rawChoices = det[1] || [];
      const choices = rawChoices.map(c => Array.isArray(c) ? c[0] : c).filter(Boolean);

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ success: false, error: 'Form URL is required.' });
    }

    const normalizedUrl = normalizeFormUrl(url);

    const response = await axios.get(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      maxRedirects: 5
    });

    const finalUrl = response.request.res?.responseUrl || normalizedUrl;
    const schema = parseFormSchema(response.data, finalUrl);

    return res.status(200).json({
      success: true,
      data: schema
    });
  } catch (error) {
    console.error('Error parsing form:', error.message);
    return res.status(200).json({
      success: false,
      error: error.message || 'Failed to parse Google Form'
    });
  }
}
