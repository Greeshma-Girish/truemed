const fs = require('fs');

/**
 * Normalizes input image into raw base64 and mimeType for Gemini Vision API
 * @param {string} imageInput - Base64 string, Data URI, HTTP/S URL, or local file path
 * @returns {Promise<{ mimeType: string, data: string }>}
 */
async function prepareGeminiImagePayload(imageInput) {
  if (!imageInput || typeof imageInput !== 'string') {
    throw new Error('Invalid image input: expected non-empty string');
  }

  const trimmed = imageInput.trim();

  // 1. Data URI (e.g. data:image/jpeg;base64,...)
  if (trimmed.startsWith('data:image/')) {
    const mimeMatch = trimmed.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const commaIdx = trimmed.indexOf(',');
    return {
      mimeType,
      data: trimmed.substring(commaIdx + 1).replace(/\s/g, '')
    };
  }

  // 2. HTTP / HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const res = await fetch(trimmed);
    if (!res.ok) throw new Error(`Failed to fetch image from URL: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return {
      mimeType: contentType.split(';')[0] || 'image/jpeg',
      data: buffer.toString('base64')
    };
  }

  // 3. Local file path
  if (fs.existsSync(trimmed)) {
    const buffer = fs.readFileSync(trimmed);
    const ext = trimmed.split('.').pop().toLowerCase();
    const mimeType = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
    return {
      mimeType,
      data: buffer.toString('base64')
    };
  }

  // 4. Raw base64 string
  return {
    mimeType: 'image/jpeg',
    data: trimmed.replace(/\s/g, '')
  };
}

/**
 * Analyzes pill image using Google Gemini Multimodal Vision API.
 * Accurately reads stamped imprint codes, detects physical shape, color, and identifies
 * medicines not present in the Roboflow dataset (such as Dolo 650, Calpol, Crocin, Augmentin, etc.).
 *
 * @param {string} imageInput - Base64, data URI, or URL
 * @param {object} [options]
 * @returns {Promise<object|null>} Parsed structured medicine data or null if key not present / failed
 */
async function analyzePillWithGemini(imageInput, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const imagePayload = await prepareGeminiImagePayload(imageInput);

    const prompt = `You are a world-class pharmaceutical computer vision system and clinical drug monograph identifier.
Carefully examine this medicine / pill / tablet / capsule image.

Perform these four exact identification tasks:
1. READ THE EXACT IMPRINT CODE:
   - Carefully examine the front, back, and bevel faces of the pill.
   - Read the stamped, debossed, engraved, embossed, scored, or printed text/numbers/logos (e.g. "DOLO 650", "CALPOL", "P 500", "AMO 250", "IBU 400", "LIP 20", "PAN 40", "M", "MICRO", or manufacturer scores).
   - If there is a score line without text, write "Single Scored Line" or "Cross Scored". If completely plain, write "Unprinted / Plain".
2. IDENTIFY PHYSICAL SHAPE:
   - Round, Capsule, Oval, Oblong, Triangle, Diamond, Pentagon, Hexagon, Biconvex, or Bullet.
3. IDENTIFY COLOR & COATING:
   - White, Off-White, Yellow, Blue, Orange, Red, Pink, Green, Peach, or Two-Tone (e.g., "Yellow / Blue").
4. IDENTIFY THE MEDICINE & MONOGRAPH:
   - Identify both global medicines and regional commercial brand tablets (e.g. Dolo 650, Calpol 500/650, Crocin Advance, Augmentin 625 Duo, Pan-D, Combiflam, Panadol, Tylenol, Advil, Lipitor, etc.).
   - Extract the generic chemical name (e.g. Paracetamol / Acetaminophen 650mg).
   - Extract manufacturer name (e.g. Micro Labs Ltd, GSK, Cipla, Sun Pharma, Abbott, etc.).
   - Extract standard dosage guidelines, approved therapeutic indications (uses), warnings, and side effects.

Respond ONLY with a valid JSON object matching this exact schema, with no markdown code blocks and no surrounding commentary:
{
  "identified": true,
  "name": "Full medicine commercial name and strength (e.g. Dolo 650mg Tablets)",
  "genericName": "Chemical generic formula (e.g. Paracetamol)",
  "brandName": "Primary brand trademark (e.g. Dolo 650)",
  "imprintCode": "Exact stamped, debossed, or engraved text read on the pill face",
  "shape": "Physical shape",
  "color": "Color coating",
  "dosage": "Typical recommended dosage instructions",
  "manufacturer": "Manufacturer name",
  "activeIngredients": ["Active Ingredient with strength", "..."],
  "uses": ["Approved therapeutic use 1", "Therapeutic use 2", "..."],
  "warnings": ["Clinical precaution 1", "..."],
  "sideEffects": ["Common side effect 1", "..."],
  "confidence": 96.5,
  "matchNotes": "Specific visual details (imprint clarity, contour, color) that confirm this pill."
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imagePayload.mimeType,
                data: imagePayload.data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json'
      }
    };

    const candidateModels = [...new Set([
      process.env.GEMINI_MODEL,
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.5-flash',
      'gemini-3.6-flash'
    ].filter(Boolean))];

    let lastError = null;
    let successfulData = null;
    let usedModel = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`[Gemini Model Try] ${model} failed with Status ${res.status}: ${errText.slice(0, 160)}`);
          lastError = `Status ${res.status} (${model}): ${errText.slice(0, 140)}`;
          continue;
        }

        const data = await res.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          successfulData = candidateText;
          usedModel = model;
          break;
        }
      } catch (reqErr) {
        lastError = reqErr.message;
      }
    }

    if (!successfulData) {
      if (lastError) console.warn(`[Gemini Vision Warning]: ${lastError}`);
      return null;
    }

    // Clean potential markdown delimiters
    const cleanJson = successfulData.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    console.log(`[Gemini Vision] Successfully identified "${parsed.name || parsed.brandName}" using ${usedModel}. Imprint: "${parsed.imprintCode || 'None'}", Shape: "${parsed.shape}", Color: "${parsed.color}"`);

    return {
      ...parsed,
      engine: 'gemini_multimodal_vision',
      modelUsed: usedModel
    };

  } catch (err) {
    console.warn('[Gemini Vision Exception]:', err.message);
    return null;
  }
}

module.exports = {
  analyzePillWithGemini,
  prepareGeminiImagePayload
};
