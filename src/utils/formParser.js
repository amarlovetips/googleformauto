/**
 * Client-side Google Form parser using public CORS proxy fallbacks.
 * Extracts FB_PUBLIC_LOAD_DATA_ directly in the browser!
 */

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

export function normalizeFormUrl(inputUrl) {
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

export async function fetchAndParseGoogleForm(formUrl) {
  const normalizedUrl = normalizeFormUrl(formUrl);

  // If the user pasted a prefilled link containing entry.XXXXXXXXX parameters directly:
  const urlObj = parsePrefilledUrl(formUrl);
  
  let htmlText = null;
  let lastErr = null;

  // Try fetching page HTML through client-side proxies
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(normalizedUrl);
      const res = await fetch(proxyUrl);
      if (res.ok) {
        htmlText = await res.text();
        if (htmlText && htmlText.includes('FB_PUBLIC_LOAD_DATA_')) {
          break;
        }
      }
    } catch (e) {
      lastErr = e;
    }
  }

  if (!htmlText || !htmlText.includes('FB_PUBLIC_LOAD_DATA_')) {
    // If HTML fetch failed or CORS proxy was blocked, check if we parsed entries from prefilled link
    if (urlObj && urlObj.fields && urlObj.fields.length > 0) {
      return urlObj;
    }
    throw new Error(
      'Could not fetch form HTML directly. If the form is private or proxy is unavailable, you can also paste a pre-filled Google Form link!'
    );
  }

  return parseFormSchemaFromHtml(htmlText, normalizedUrl);
}

function parseFormSchemaFromHtml(html, formUrl) {
  // Extract Form Title
  let formTitle = 'Google Form';
  const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/property="og:title"\s+content="(.*?)"/i);
  if (titleMatch && titleMatch[1]) {
    formTitle = titleMatch[1].replace(' - Google Forms', '').replace(' - Google Docs', '').trim();
  }

  // Extract FB_PUBLIC_LOAD_DATA_
  const scriptMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);\s*<\/script>|FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);/);
  if (!scriptMatch) {
    throw new Error('Failed to extract FB_PUBLIC_LOAD_DATA_ script from page.');
  }

  const jsonStr = scriptMatch[1] || scriptMatch[2];
  let rawData;
  try {
    rawData = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error('Failed to parse form structure JSON.');
  }

  // Extract Form ID & Title
  let formId = '';
  const idMatch = formUrl.match(/\/d\/e\/([^\/]+)/);
  if (idMatch) {
    formId = idMatch[1];
  } else if (rawData[14]) {
    formId = rawData[14];
  }

  if (rawData[1] && rawData[1][0]) {
    formTitle = rawData[1][0] || formTitle;
  }
  let formDescription = (rawData[1] && rawData[1][1]) || '';

  const submitUrl = formId 
    ? `https://docs.google.com/forms/d/e/${formId}/formResponse`
    : formUrl.replace('/viewform', '/formResponse');

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

function parsePrefilledUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const fields = [];

    params.forEach((val, key) => {
      if (key.startsWith('entry.')) {
        fields.push({
          id: key,
          entryId: key,
          title: `Field (${key})`,
          description: '',
          type: 'short_text',
          required: false,
          choices: []
        });
      }
    });

    if (fields.length > 0) {
      const formIdMatch = url.match(/\/d\/e\/([^\/]+)/);
      const formId = formIdMatch ? formIdMatch[1] : '';
      return {
        formTitle: 'Prefilled Google Form',
        formDescription: 'Extracted entry IDs from URL parameters',
        formUrl: url,
        submitUrl: formId ? `https://docs.google.com/forms/d/e/${formId}/formResponse` : url.replace('/viewform', '/formResponse'),
        formId,
        fields
      };
    }
  } catch (e) {
    // ignore invalid URL
  }
  return null;
}
