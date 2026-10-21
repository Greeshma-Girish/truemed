# 🤖 TrueMed AI: Medicine Identification & Counterfeit Detection Plan

This document outlines the end-to-end Machine Learning strategy, model architecture, dataset pipeline, training procedures, and backend integration guide for real-world medicine identification and counterfeit detection in **TrueMed**.

---

## 🏛️ 1. High-Level AI Architecture (Multi-Modal Hybrid Pipeline)

Pill identification from camera images requires more than standard image classification. Counterfeits often match the general shape and color of authentic pills but diverge in **imprint typography, texture density, micro-stamping, and color shades**.

```
                   ┌────────────────────────────────────────┐
                   │           Input Camera Image           │
                   └───────────────────┬────────────────────┘
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │   Stage 1: Pill Detection & Crop       │
                   │      (YOLOv8 / OpenCV Contours)        │
                   └───────────────────┬────────────────────┘
                                       │
                                       ▼
                 ┌─────────────────────┴─────────────────────┐
                 │                                           │
                 ▼                                           ▼
┌──────────────────────────────────┐       ┌──────────────────────────────────┐
│ Stage 2: Visual Classification   │       │   Stage 3: Imprint OCR Engine    │
│ (EfficientNet-B0 / MobileNetV3)  │       │      (EasyOCR / PaddleOCR)       │
│ - Color, Shape, Texture, Form    │       │ - Pill codes (e.g. "P 500", "M") │
└────────────────┬─────────────────┘       └────────────────┬─────────────────┘
                 │                                           │
                 └─────────────────────┬─────────────────────┘
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │ Stage 4: Fusion & Monograph Matching   │
                   │ - Cross-verify Visual ID + OCR Imprint │
                   └───────────────────┬────────────────────┘
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │  Stage 5: Counterfeit Anomaly Engine   │
                   │ - Micro-texture & packaging validation │
                   │ - Similarity score against monograph   │
                   └───────────────────┬────────────────────┘
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │ Final JSON Result (GENUINE/COUNTERFEIT)│
                   └───────────────────┬────────────────────┘
```

---

## 🔬 2. ML Algorithm & Framework Comparison

### A. Recommended Visual Classifier Models
| Algorithm / Model | Model Size | Accuracy | Speed | Best Suited For |
|---|---|---|---|---|
| **EfficientNet-B0 / B2** *(Recommended)* | ~20 MB | **96.8%** | Fast (25ms) | Highest accuracy-to-size ratio for visual feature extraction |
| **MobileNetV3-Large** *(Recommended Edge)* | ~15 MB | **95.2%** | Ultra Fast (12ms) | Real-time client-side mobile inference & low-memory servers |
| **ResNet-50** | ~98 MB | 95.5% | Medium (45ms) | Deep baseline model; higher compute cost |
| **Vision Transformer (ViT-Base)** | ~340 MB | 97.4% | Slow (120ms) | Heavy cloud servers; excessive overhead for edge deployment |

### B. Framework Choice: PyTorch vs. TensorFlow
* **Training Framework**: **PyTorch** with `timm` (PyTorch Image Models) and `torchvision`.
  * **Why PyTorch?** Dynamic computation graphs, superior community adoption for transfer learning, easier fine-tuning, and native high-speed export to **ONNX**.
* **Deployment Engine**: **ONNX Runtime (`onnxruntime-node`)** or **FastAPI Python Microservice**.
  * **Why ONNX?** Enables running PyTorch/TensorFlow trained models directly inside **Node.js** with C++ speed without launching separate heavy Python subprocesses for every request.

---

## 📊 3. Datasets & Data Augmentation Strategy

### A. Reference Pill Datasets
1. **NIH ePillID Dataset (NLM RxImage)**:
   - 7,000+ high-resolution images of official prescription pills cataloged by the US National Library of Medicine.
   - Includes full metadata: Pill Imprint, Shape, Color, Score line, NDC code, Drug name.
2. **Kaggle Pill Image Dataset**:
   - 5,000+ consumer camera photos of common over-the-counter and prescription drugs.
3. **TrueMed Synthetic & Counterfeit Dataset (Custom)**:
   - Genuine vs. Fake pair samples created by introducing visual anomalies (blurred imprints, texture degradation, color shifting, font kerning divergence).

### B. Data Augmentation Pipeline (`Albumentations`)
To handle smartphone camera variances (lighting, shadows, angles, focus blur):
```python
import albumentations as A
from albumentations.pytorch import ToTensorV2

train_transform = A.Compose([
    A.Resize(224, 224),
    A.RandomRotate90(p=0.5),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.5),
    A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.7),
    A.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.05, p=0.5),
    A.GaussNoise(var_limit=(10.0, 50.0), p=0.3),
    A.Perspective(scale=(0.05, 0.1), p=0.4),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ToTensorV2()
])
```

---

## 🛠️ 4. Step-by-Step Training Pipeline

### Step 1: Dataset Preparation & Preprocessing
1. Download NIH ePillID dataset or prepare images in folder structure:
   ```
   dataset/
   ├── train/
   │   ├── paracetamol_500mg/
   │   ├── amoxicillin_250mg/
   │   ├── ibuprofen_400mg/
   │   └── metformin_500mg/
   └── val/
       ├── paracetamol_500mg/
       └── ...
   ```

### Step 2: Model Training Script (`train_pill_classifier.py`)
```python
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# 1. Load Pre-trained EfficientNet-B0
def create_model(num_classes):
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    # Freeze initial layers for fast transfer learning
    for param in model.features.parameters():
        param.requires_grad = False
    
    # Replace final classifier head
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(512, num_classes)
    )
    return model

# 2. Training Loop (PyTorch)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = create_model(num_classes=50).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)

# Fine-tuning epochs...
```

### Step 3: Imprint OCR Extraction Engine (`pill_ocr.py`)
```python
import easyocr
import cv2

reader = easyocr.Reader(['en'], gpu=False)

def extract_imprint_text(image_path):
    img = cv2.imread(image_path)
    # Preprocessing: Grayscale & Contrast enhancement
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    enhanced = cv2.equalizeHist(gray)
    
    results = reader.readtext(enhanced)
    extracted_texts = [text[1].upper() for text in results if text[2] > 0.4]
    return extracted_texts
```

### Step 4: Export Model to ONNX
```python
import torch

def export_to_onnx(model, save_path="pill_classifier.onnx"):
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model,
        dummy_input,
        save_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input_image'],
        output_names=['class_probabilities'],
        dynamic_axes={'input_image': {0: 'batch_size'}, 'class_probabilities': {0: 'batch_size'}}
    )
    print(f"Model successfully exported to {save_path}")
```

---

## ⚡ 5. TrueMed Backend Integration Plan

### Option 1: Direct Node.js ONNX Execution (Zero Python Server Dependency)
Using `onnxruntime-node` inside Node.js for high-speed inference without spawning external CLI processes:

```javascript
// backend/utils/mlInference.js
const ort = require('onnxruntime-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

let session = null;

async function loadModel() {
  if (!session) {
    const modelPath = path.join(__dirname, '../ml/pill_classifier.onnx');
    session = await ort.InferenceSession.create(modelPath);
  }
  return session;
}

async function runPillInference(imageBuffer) {
  const sess = await loadModel();
  
  // Resize & normalize image buffer using sharp
  const resizedBuffer = await sharp(imageBuffer)
    .resize(224, 224)
    .toFormat('raw')
    .toBuffer();

  // Convert to Float32 Tensor [1, 3, 224, 224]
  // Run inference session
  const tensor = new ort.Tensor('float32', float32Array, [1, 3, 224, 224]);
  const feeds = { input_image: tensor };
  const results = await sess.run(feeds);
  
  return results.class_probabilities.data;
}
```

### Option 2: Python FastAPI Microservice (Full Hybrid OCR + CNN + Anomaly Engine)
Run a lightweight FastAPI microservice at `http://localhost:8000/predict_pill` with PyTorch + EasyOCR.

### Option 3: Production Roboflow Serverless Workflow (Active Production Engine)
Using Roboflow's serverless GPU inference infrastructure to run the ResNet18 classifier workflow:

* **Workflow Name:** `trueMed vtruemed-ednuz-1-resnet18-t1 Logic`
* **Workspace Slug:** `greeshma-3gcnw`
* **Workflow ID:** `truemed-vtruemed-ednuz-1-resnet18-t1-logic`
* **Serverless Endpoint:** `https://serverless.roboflow.com/greeshma-3gcnw/workflows/truemed-vtruemed-ednuz-1-resnet18-t1-logic`
* **Client Implementation:** [`backend/utils/roboflowClient.js`](file:///d:/truemed/backend/utils/roboflowClient.js)
* **Auth:** Bearer header with `ROBOFLOW_API_KEY`
* **Verification Smoke Test:** `npm run test:roboflow` in `backend/`

---

## 🎯 6. Strategic Implementation Roadmap

| Phase | Milestone | Tasks | Output Artifact |
|---|---|---|---|
| **Phase 1** | **Dataset & Baseline (Week 1)** | Download NIH ePillID dataset, annotate top 20 common medicines, set up data augmentations | Prepared dataset directory & dataset loader script |
| **Phase 2** | **Model Training (Week 2)** | Train EfficientNet-B0 classifier on PyTorch, fine-tune accuracy to >95% | `pill_classifier.pt` model weights |
| **Phase 3** | **OCR & Counterfeit Rule Engine (Week 3)** | Integrate EasyOCR for imprint extraction, write texture anomaly & font divergence scoring rules | `counterfeit_verifier.py` module |
| **Phase 4** | **ONNX Export & Backend Integration (Week 4)** | Export `.pt` -> `.onnx`, connect to Node.js `scanController.js` API, test live scans from frontend UI | Fully integrated end-to-end ML scanner |

---
