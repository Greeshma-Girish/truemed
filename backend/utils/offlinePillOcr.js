const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

/**
 * Extracts stamped debossed/printed text on a pill offline using Tesseract OCR.
 * Acts as a resilient fallback when Cloud Vision APIs (Gemini) experience 429 quota limits or offline state.
 *
 * @param {string} imageInput - Base64 string, Data URI, HTTP/S URL, or file path
 * @returns {Promise<string>} Extracted alphanumeric imprint text
 */
async function extractPillTextWithTesseract(imageInput) {
  if (!imageInput || typeof imageInput !== 'string') return '';

  let tempFilePath = null;
  try {
    let inputForTesseract = imageInput;
    const trimmed = imageInput.trim();

    if (trimmed.startsWith('data:image')) {
      const base64Data = trimmed.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      tempFilePath = path.join(__dirname, `../scratch_ocr_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);
      fs.writeFileSync(tempFilePath, buffer);
      inputForTesseract = tempFilePath;
    } else if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !fs.existsSync(trimmed)) {
      // Raw base64 string
      try {
        const buffer = Buffer.from(trimmed, 'base64');
        tempFilePath = path.join(__dirname, `../scratch_ocr_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);
        fs.writeFileSync(tempFilePath, buffer);
        inputForTesseract = tempFilePath;
      } catch (e) {
        inputForTesseract = trimmed;
      }
    }

    const { data } = await Tesseract.recognize(inputForTesseract, 'eng', {
      logger: () => {}
    });

    const raw = (data && data.text) ? data.text : '';
    // Normalize alphanumeric characters while preserving spaces and hyphens
    const clean = raw.replace(/[^a-zA-Z0-9\s\-\/]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
    return clean;
  } catch (err) {
    return '';
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (e) {}
    }
  }
}

module.exports = {
  extractPillTextWithTesseract
};
