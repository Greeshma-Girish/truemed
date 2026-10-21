const assert = require('assert');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { analyzePillImage } = require('./utils/mlInference');

async function runSmokeTest() {
  console.log('🧪 Starting Roboflow TrueMed Integration Smoke Test...');

  // Use a real image URL
  const testImageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400';

  console.log(`📡 Sending test sample image to Roboflow workflow...`);
  const result = await analyzePillImage(testImageUrl);

  console.log('\n✅ Verification Result Received:');
  console.log(' - Verdict:', result.verdict);
  console.log(' - Confidence:', result.confidence + '%');
  console.log(' - Detected Medicine:', result.medicine ? result.medicine.name : 'N/A');
  console.log(' - Imprint Score:', result.breakdown?.imprintMatchScore);
  console.log(' - Model Used:', result.breakdown?.roboflow?.modelId);
  console.log(' - Top Class:', result.breakdown?.roboflow?.topPrediction);

  // Assertions
  assert.ok(result.success, 'Result should have success: true');
  assert.ok(['IDENTIFIED', 'GENUINE', 'SUSPICIOUS', 'COUNTERFEIT'].includes(result.verdict), 'Verdict should be a valid classification');
  assert.strictEqual(typeof result.confidence, 'number', 'Confidence should be a number');
  assert.ok(result.medicine, 'Result should include medicine details');
  assert.ok(result.breakdown, 'Result should include breakdown details');
  assert.ok(result.breakdown.roboflow, 'Result should include Roboflow workflow telemetry');

  console.log('\n🎉 ALL ASSERTIONS PASSED! Roboflow Workflow successfully integrated into TrueMed!\n');
}

runSmokeTest().catch(err => {
  console.error('\n❌ Smoke test failed:', err);
  process.exit(1);
});
