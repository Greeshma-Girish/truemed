const https = require('https');
const fs = require('fs');

// Custom error classes for clean error handling
class RoboflowError extends Error {
  constructor(message, statusCode = null, details = null) {
    super(message);
    this.name = 'RoboflowError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class RoboflowTimeoutError extends RoboflowError {
  constructor(message = 'Roboflow request timed out') {
    super(message, 408);
    this.name = 'RoboflowTimeoutError';
  }
}

class RoboflowAuthError extends RoboflowError {
  constructor(message = 'Invalid or missing Roboflow API key') {
    super(message, 401);
    this.name = 'RoboflowAuthError';
  }
}

/**
 * Normalizes input image into the format required by Roboflow Workflow:
 * { type: 'url', value: 'https://...' } OR { type: 'base64', value: '...' }
 * @param {string} input - URL, data URI, raw base64 string, or local file path
 * @returns {{ type: 'url'|'base64', value: string }}
 */
function prepareImagePayload(input) {
  if (!input || typeof input !== 'string') {
    throw new RoboflowError('Invalid image input: expected a non-empty string');
  }

  const trimmed = input.trim();

  // If already an HTTP/HTTPS URL
  if (trimmed.startsWith('https://')) {
    return { type: 'url', value: trimmed };
  }
  if (trimmed.startsWith('http://')) {
    // Roboflow serverless rejects plain http:// with RuntimeInputError
    return { type: 'url', value: trimmed.replace(/^http:\/\//i, 'https://') };
  }

  // If Data URI (e.g. data:image/jpeg;base64,....)
  if (trimmed.startsWith('data:image/')) {
    const commaIndex = trimmed.indexOf(',');
    if (commaIndex !== -1) {
      return { type: 'base64', value: trimmed.substring(commaIndex + 1) };
    }
  }

  // If local file path exists
  if (fs.existsSync(trimmed)) {
    const fileBytes = fs.readFileSync(trimmed);
    return { type: 'base64', value: fileBytes.toString('base64') };
  }

  // Assume raw base64 string
  return { type: 'base64', value: trimmed };
}

/**
 * Executes an HTTPS POST request with timeout
 * @param {string} url 
 * @param {string} apiKey 
 * @param {object} payload 
 * @param {number} timeoutMs 
 * @returns {Promise<object>}
 */
function postWorkflowRequest(url, apiKey, payload, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const bodyStr = JSON.stringify(payload);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent': 'TrueMed-Backend/1.0.0'
      },
      timeout: timeoutMs
    };

    let timedOut = false;

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (timedOut) return;

        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (err) {
          return reject(new RoboflowError(`Invalid JSON received from Roboflow (status ${res.statusCode}): ${data.slice(0, 150)}`, res.statusCode));
        }

        if (res.statusCode === 401 || res.statusCode === 403) {
          return reject(new RoboflowAuthError(parsed.message || 'Roboflow authentication failed'));
        }

        if (res.statusCode >= 400) {
          return reject(new RoboflowError(parsed.message || `Roboflow error ${res.statusCode}`, res.statusCode, parsed));
        }

        resolve(parsed);
      });
    });

    req.on('timeout', () => {
      timedOut = true;
      req.destroy();
      reject(new RoboflowTimeoutError(`Roboflow request timed out after ${timeoutMs}ms`));
    });

    req.on('error', (err) => {
      if (timedOut) return;
      reject(new RoboflowError(`Network error communicating with Roboflow: ${err.message}`));
    });

    req.write(bodyStr);
    req.end();
  });
}

/**
 * Runs a Roboflow Workflow with retries and exponential backoff
 * @param {string} imageInput - Base64, Data URI, file path, or image URL
 * @param {object} [options]
 * @param {number} [options.maxRetries=2] - Number of retry attempts on transient errors
 * @param {number} [options.timeout=25000] - Request timeout in milliseconds
 * @param {object} [options.parameters={}] - Additional workflow runtime parameters
 * @returns {Promise<object>} Parsed predictions and metadata
 */
async function runRoboflowWorkflow(imageInput, options = {}) {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) {
    throw new RoboflowAuthError('ROBOFLOW_API_KEY environment variable is not defined.');
  }

  const workspace = process.env.ROBOFLOW_WORKSPACE || 'greeshma-3gcnw';
  const workflowId = process.env.ROBOFLOW_WORKFLOW_ID || 'truemed-vtruemed-ednuz-1-resnet18-t1-logic';
  const serverlessUrl = process.env.ROBOFLOW_SERVERLESS_URL || 'https://serverless.roboflow.com';

  const endpointUrl = `${serverlessUrl}/${workspace}/workflows/${workflowId}`;
  const imagePayload = prepareImagePayload(imageInput);

  const payload = {
    inputs: {
      image: imagePayload
    }
  };

  if (options.parameters && Object.keys(options.parameters).length > 0) {
    payload.parameters = options.parameters;
  }

  const maxRetries = options.maxRetries ?? 2;
  const timeoutMs = options.timeout ?? 25000;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
        await new Promise(r => setTimeout(r, delayMs));
      }

      const response = await postWorkflowRequest(endpointUrl, apiKey, payload, timeoutMs);
      return parseWorkflowResponse(response);

    } catch (err) {
      lastError = err;
      // Do not retry 4xx errors (client errors or auth issues)
      if (err instanceof RoboflowAuthError || (err.statusCode >= 400 && err.statusCode < 500 && err.statusCode !== 408)) {
        throw err;
      }
    }
  }

  throw lastError;
}

/**
 * Defensively parses the workflow response and handles any embedded base64 image outputs
 * @param {object} rawResponse 
 * @returns {object} Normalized inference summary
 */
function parseWorkflowResponse(rawResponse) {
  if (!rawResponse || !Array.isArray(rawResponse.outputs) || rawResponse.outputs.length === 0) {
    throw new RoboflowError('Roboflow response contains no outputs', 500, rawResponse);
  }

  const outputItem = rawResponse.outputs[0] || {};
  
  // Clean up any heavy base64 image-shaped outputs to conserve memory
  for (const [key, val] of Object.entries(outputItem)) {
    if (val && typeof val === 'object' && val.type === 'base64') {
      delete outputItem[key];
    }
  }

  // Workflow predictions block
  const predictionsBlock = outputItem.predictions || outputItem;

  const topClass = predictionsBlock.top || (predictionsBlock.predictions?.[0]?.class) || 'unknown';
  const confidence = typeof predictionsBlock.confidence === 'number' 
    ? predictionsBlock.confidence 
    : (predictionsBlock.predictions?.[0]?.confidence || 0.0);

  const candidates = Array.isArray(predictionsBlock.predictions) 
    ? predictionsBlock.predictions.map(p => ({
        class: p.class,
        confidence: p.confidence,
        classId: p.class_id
      }))
    : [];

  return {
    success: true,
    topClass,
    confidence,
    candidates,
    inferenceId: predictionsBlock.inference_id || null,
    inferenceTimeSec: predictionsBlock.time || 0,
    model: predictionsBlock.resolved_model || {
      model_id: 'greeshma-3gcnw/truemed-ednuz-1-resnet18-t1'
    },
    raw: predictionsBlock
  };
}

/**
 * Direct classification endpoint on classify.roboflow.com/truemed-ednuz/1
 * Fast (under 100ms) with full predictions and confidence scores

 * @param {string} imageInput 
 * @param {number} [timeoutMs=15000] 
 * @returns {Promise<object>}
 */
async function classifyPillDirect(imageInput, timeoutMs = 15000) {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) throw new RoboflowAuthError('ROBOFLOW_API_KEY environment variable is not defined.');

  const modelId = process.env.ROBOFLOW_MODEL_ID || 'truemed-ednuz/1';
  const imgPayload = prepareImagePayload(imageInput);

  return new Promise((resolve, reject) => {
    let path = `/${modelId}?api_key=${apiKey}`;
    let body = null;
    let headers = { 'User-Agent': 'TrueMed-Backend/1.0.0' };

    if (imgPayload.type === 'url') {
      path += `&image=${encodeURIComponent(imgPayload.value)}`;
    } else {
      body = imgPayload.value;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const options = {
      hostname: 'classify.roboflow.com',
      port: 443,
      path: path,
      method: imgPayload.type === 'url' ? 'GET' : 'POST',
      headers: headers,
      timeout: timeoutMs
    };

    let timedOut = false;
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (timedOut) return;
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            return reject(new RoboflowError(parsed.message || `Roboflow error ${res.statusCode}`, res.statusCode));
          }
          const topClass = parsed.top || (parsed.predictions?.[0]?.class) || '';
          const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : (parsed.predictions?.[0]?.confidence || 0.0);
          const candidates = Array.isArray(parsed.predictions) ? parsed.predictions.map(p => ({
            class: p.class,
            confidence: p.confidence,
            classId: p.class_id
          })) : [];

          resolve({
            success: true,
            topClass: topClass || (candidates[0]?.class || ''),
            confidence: confidence,
            candidates: candidates,
            inferenceId: parsed.inference_id || null,
            inferenceTimeSec: parsed.time || 0,
            model: parsed.resolved_model || { model_id: 'truemed-ednuz/1' }
          });
        } catch (e) {
          reject(new RoboflowError('Invalid response from Roboflow classify: ' + data.slice(0, 100)));
        }
      });
    });

    req.on('timeout', () => {
      timedOut = true;
      req.destroy();
      reject(new RoboflowTimeoutError(`Roboflow direct classify timed out after ${timeoutMs}ms`));
    });

    req.on('error', (err) => {
      if (timedOut) return;
      reject(new RoboflowError(`Network error communicating with Roboflow: ${err.message}`));
    });

    if (body) req.write(body);
    req.end();
  });
}

module.exports = {
  runRoboflowWorkflow,
  classifyPillDirect,
  prepareImagePayload,
  RoboflowError,
  RoboflowAuthError,
  RoboflowTimeoutError
};

