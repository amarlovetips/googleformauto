/**
 * Universal Multi-Strategy Google Form Parser.
 * Handles forms.gle shortlinks, FB_PUBLIC_LOAD_DATA_, AF_initDataCallback,
 * raw HTML entry tags, and fallback URL parameters.
 */

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

export async function fetchAndParseGoogleForm(input) {
  const trimmedInput = input.trim();

  // 1. Check if input is raw HTML code or contains FB_PUBLIC_LOAD_DATA_ directly
  if (trimmedInput.includes('FB_PUBLIC_LOAD_DATA_') || trimmedInput.includes('entry.')) {
    const rawParsed = parseUniversalFormContent(trimmedInput, 'https://docs.google.com/forms');
    if (rawParsed && rawParsed.fields && rawParsed.fields.length > 0) {
      return rawParsed;
    }
  }

  const normalizedUrl = normalizeFormUrl(trimmedInput);

  // 2. Try Local / Express / Vercel API backend (/api/parse-form)
  try {
    const apiRes = await fetch('/api/parse-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: normalizedUrl })
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json && json.success && json.data && json.data.fields && json.data.fields.length > 0) {
        return json.data;
      }
    }
  } catch (e) {
    // API backend not available or running in static host mode
  }

  // 3. Strategy A: AllOrigins JSON Wrapper Proxy (High Reliability)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const json = await res.json();
      if (json && json.contents) {
        const parsed = parseUniversalFormContent(json.contents, normalizedUrl);
        if (parsed && parsed.fields && parsed.fields.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    // try next
  }

  // 4. Strategy B: CorsProxy.io
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const html = await res.text();
      const parsed = parseUniversalFormContent(html, normalizedUrl);
      if (parsed && parsed.fields && parsed.fields.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // try next
  }

  // 5. Strategy C: Codetabs Proxy
  try {
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const html = await res.text();
      const parsed = parseUniversalFormContent(html, normalizedUrl);
      if (parsed && parsed.fields && parsed.fields.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // try next
  }

  // 6. Strategy D: AllOrigins Raw
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const html = await res.text();
      const parsed = parseUniversalFormContent(html, normalizedUrl);
      if (parsed && parsed.fields && parsed.fields.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // try next
  }

  // 7. Check if input is a prefilled link with entry.XXXXXXXXX parameters
  const prefilledObj = parsePrefilledUrl(input);
  if (prefilledObj && prefilledObj.fields && prefilledObj.fields.length > 0) {
    return prefilledObj;
  }

  throw new Error(
    'Could not parse Google Form. Ensure the form link is public, OR paste a pre-filled Google Form link / view-source HTML.'
  );
}

/**
 * Universal content parser:
 * Attempts FB_PUBLIC_LOAD_DATA_, AF_initDataCallback, and HTML name="entry.XXX" tags.
 */
function parseUniversalFormContent(content, pageUrl) {
  let formTitle = 'Google Form';
  let formDescription = '';

  // Extract Title
  const titleMatch = content.match(/<title>(.*?)<\/title>/i) || content.match(/property="og:title"\s+content="(.*?)"/i);
  if (titleMatch && titleMatch[1]) {
    formTitle = titleMatch[1].replace(' - Google Forms', '').replace(' - Google Docs', '').trim();
  }

  // 1. Try FB_PUBLIC_LOAD_DATA_
  const scriptMatch = content.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);\s*<\/script>|FB_PUBLIC_LOAD_DATA_\s*=\s*([\s\S]+?);/);
  if (scriptMatch) {
    try {
      const jsonStr = scriptMatch[1] || scriptMatch[2];
      const rawData = JSON.parse(jsonStr);

      let formId = '';
      const idMatch = pageUrl.match(/\/d\/e\/([^\/]+)/);
      if (idMatch) {
        formId = idMatch[1];
      } else if (rawData[14]) {
        formId = rawData[14];
      }

      if (rawData[1] && rawData[1][0]) {
        formTitle = rawData[1][0] || formTitle;
      }
      formDescription = (rawData[1] && rawData[1][1]) || '';

      const submitUrl = formId 
        ? `https://docs.google.com/forms/d/e/${formId}/formResponse`
        : pageUrl.replace('/viewform', '/formResponse');

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

      if (fields.length > 0) {
        return {
          formTitle,
          formDescription,
          formUrl: pageUrl,
          submitUrl,
          formId,
          fields
        };
      }
    } catch (e) {
      // fallback
    }
  }

  // 2. Fallback: Parse HTML for name="entry.XXXXXXXXX" input tags directly
  const entryMatches = Array.from(content.matchAll(/name=["'](entry\.\d+)["']/gi));
  if (entryMatches.length > 0) {
    const uniqueEntries = Array.from(new Set(entryMatches.map(m => m[1])));
    const formIdMatch = content.match(/\/d\/e\/([^\/]+)\/formResponse/) || pageUrl.match(/\/d\/e\/([^\/]+)/);
    const formId = formIdMatch ? formIdMatch[1] : '';

    const fields = uniqueEntries.map((entryId, idx) => ({
      id: entryId,
      entryId: entryId,
      title: `Form Question ${idx + 1} (${entryId})`,
      description: '',
      type: 'short_text',
      required: false,
      choices: []
    }));

    return {
      formTitle: formTitle || 'Google Form',
      formDescription: 'Extracted from HTML input elements',
      formUrl: pageUrl,
      submitUrl: formId ? `https://docs.google.com/forms/d/e/${formId}/formResponse` : pageUrl.replace('/viewform', '/formResponse'),
      formId,
      fields
    };
  }

  return null;
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
    // ignore
  }
  return null;
}
