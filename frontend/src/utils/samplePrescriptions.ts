/**
 * Helper to generate realistic high-resolution prescription slip document images
 * with crystal clear text for real OCR optical scanning
 */

export interface SampleRxPreset {
  id: string;
  title: string;
  subtitle: string;
  doctor: string;
  clinic: string;
  patient: string;
  date: string;
  meds: string[];
  notes: string;
}

export const SAMPLE_PRESETS: SampleRxPreset[] = [
  {
    id: 'white-tusk-dental',
    title: 'The White Tusk',
    subtitle: 'Augmentin + Enzoflam + Pan-D',
    doctor: 'Dr. Dental Surgeon, B.D.S., M.D.S.',
    clinic: 'THE WHITE TUSK • DENTAL CLINIC',
    patient: 'Mr. Sachin Bansare. 28/m',
    date: '12/10/22',
    meds: [
      'after meals {',
      'Tab. Augmentin 625mg',
      '1 - 0 - 1 x 5days',
      'Tab. Enzoflam',
      '1 - 0 - 1 x 5days',
      'before meals {',
      'Tab. Pan-D 40mg',
      '1 - 0 - 0 x 5days',
      'Adv: Hexigel gum paint massage',
      '1 - 0 - 1 x 1week'
    ],
    notes: 'Smile Designing | Teeth Whitening | Dental Implants | General Dentistry'
  },
  {
    id: 'quest-care-clinic',
    title: 'Quest Care Clinic',
    subtitle: 'Rantac 150mg + CAP SM FIBRO',
    doctor: 'Mr. Anil Kumar Sharma M.D.S. (Pune) Reg: A-77363',
    clinic: 'Quest Care Medical Clinic • Mumbai',
    patient: 'Patient: Aakruti Kapoor, Female, 31 years',
    date: '01-05-2019',
    meds: [
      'Medicine          Dosage    Duration    Instructions',
      'Tab Rantac 150mg  1-1-1     3 days      After Meal',
      'CAP SM FIBRO      1-0-1     5 days      Before Food'
    ],
    notes: 'Diagnosis: Dengue. Complaint: Full Body Pain, Weakness. Keep measuring body Temp. twice a day.'
  },
  {
    id: 'hospital-cardiology',
    title: 'Hospital Cardiology Rx',
    subtitle: 'Atorvastatin + Metformin',
    doctor: 'Dr. Elena Rostova, MD, FACC',
    clinic: 'METRO GENERAL HOSPITAL • CARDIOLOGY INSTITUTE',
    patient: 'David Miller (DOB: 11-AUG-1974)',
    date: '2026-10-15',
    meds: [
      '1. Atorva 20mg Tablets (Atorvastatin Calcium)',
      '   Sig: 1 tab po qd at bedtime x 30 days',
      '   Instructions: Take with water at bedtime. Avoid grapefruit juice.',
      '2. Glycomet 500mg Tablets (Metformin Hydrochloride)',
      '   Sig: 1 tab po bid with morning and evening meals x 30 days',
      '   Instructions: Take with food. Monitor blood glucose weekly.'
    ],
    notes: 'Primary hypercholesterolemia management. Routine lipid profile and HbA1c review in 12 weeks.'
  }
];

/**
 * Renders a crisp, authentic clinical prescription document onto a high-res canvas
 * and returns it as a PNG Data URL so OCR engine can recognize the exact characters
 */
export const generateSamplePrescriptionImage = (presetId: string): string => {
  const preset = SAMPLE_PRESETS.find(p => p.id === presetId) || SAMPLE_PRESETS[0];

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background: Crisp off-white medical bond paper
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle security grid / border watermark
  ctx.strokeStyle = '#31786F';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.strokeStyle = '#DCE5E3';
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

  // Clinic Header
  ctx.fillStyle = '#202B29';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(preset.clinic, canvas.width / 2, 100);

  ctx.fillStyle = '#586B67';
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DEPARTMENT OF CLINICAL HEALTHCARE & PHARMACOTHERAPY', canvas.width / 2, 135);
  ctx.fillText('Registration / License Monogram Verified • TrueMed Clinical Suite', canvas.width / 2, 165);

  // Divider Line
  ctx.strokeStyle = '#31786F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 190);
  ctx.lineTo(canvas.width - 60, 190);
  ctx.stroke();

  // Prescriber & Patient Meta Header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#202B29';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`PRESCRIBER: ${preset.doctor}`, 70, 240);

  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`PATIENT: ${preset.patient}`, 70, 290);
  ctx.fillText(`DATE: ${preset.date}`, 820, 290);

  // Second Divider
  ctx.strokeStyle = '#DCE5E3';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 325);
  ctx.lineTo(canvas.width - 60, 325);
  ctx.stroke();

  // Rx Symbol
  ctx.fillStyle = '#31786F';
  ctx.font = 'bold 72px "Georgia", serif';
  ctx.fillText('℞', 70, 420);

  // Prescribed Medication Lines
  let currentY = 470;
  for (const line of preset.meds) {
    if (line.includes('after meals') || line.includes('before meals')) {
      ctx.fillStyle = '#31786F';
      ctx.font = 'bold italic 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      currentY += 10;
    } else if (line.startsWith('Tab') || line.startsWith('CAP') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('Adv:')) {
      ctx.fillStyle = '#1D2C2A';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      currentY += 15;
    } else if (line.includes('1 - 0 - 1') || line.includes('1-1-1') || line.includes('1 - 0 - 0')) {
      ctx.fillStyle = '#0F5147';
      ctx.font = 'bold 24px "Courier New", monospace';
    } else {
      ctx.fillStyle = '#445E58';
      ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
    ctx.fillText(line, 80, currentY);
    currentY += 44;
  }

  // Physician Clinical Notes
  currentY += 35;
  ctx.strokeStyle = '#DCE5E3';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, currentY);
  ctx.lineTo(canvas.width - 70, currentY);
  ctx.stroke();

  currentY += 40;
  ctx.fillStyle = '#202B29';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('PHYSICIAN NOTES & CLINICAL OBSERVATIONS:', 80, currentY);

  currentY += 35;
  ctx.fillStyle = '#586B67';
  ctx.font = 'italic 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const words = preset.notes.split(' ');
  let noteLine = '';
  for (const w of words) {
    const test = noteLine + w + ' ';
    if (ctx.measureText(test).width > 1000) {
      ctx.fillText(noteLine, 80, currentY);
      currentY += 32;
      noteLine = w + ' ';
    } else {
      noteLine = test;
    }
  }
  if (noteLine) {
    ctx.fillText(noteLine, 80, currentY);
    currentY += 32;
  }

  // Footer & Digital Signature
  const footerY = canvas.height - 180;
  ctx.strokeStyle = '#202B29';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(700, footerY);
  ctx.lineTo(1100, footerY);
  ctx.stroke();

  ctx.fillStyle = '#1D2C2A';
  ctx.font = 'italic bold 24px "Georgia", serif';
  ctx.fillText(`Signed: ${preset.doctor.split(',')[0]}`, 720, footerY - 15);

  ctx.fillStyle = '#7D938F';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Authorized Electronic Prescriber • TrueMed Security Monogram Verified', 700, footerY + 28);
  ctx.fillText('Dispense as written. Verification against authentic pharmaceutical monographs required.', 70, canvas.height - 70);

  return canvas.toDataURL('image/png');
};
