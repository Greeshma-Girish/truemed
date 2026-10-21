"""
Organize RxImage pill photos into one folder per medicine (classification
format), ready to upload to Roboflow.

Usage:  python build_pill_dataset.py
"""

import os
import re
import shutil
import pandas as pd

# ============================================================
# CONFIGURATION
# ============================================================
ROOT_DIR = r"C:\Users\HP\Downloads\rximage"
TABLE_FILE = os.path.join(ROOT_DIR, "table.csv")          # .csv or .xlsx
IMAGE_DIR = os.path.join(ROOT_DIR, "image", "images", "gallery", "original")
OUTPUT_DIR = os.path.join(ROOT_DIR, "pill_dataset")

# True  -> "Loperamide 2 MG Oral Tablet" becomes "Loperamide"
# False -> keep the full name as the class name
SHORT_CLASS_NAMES = True

# Drop classes that have fewer images than this (Roboflow trains poorly on 1-2)
MIN_IMAGES_PER_CLASS = 1

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


# ============================================================
# HELPERS
# ============================================================
def clean_name(name):
    name = str(name).strip()
    if SHORT_CLASS_NAMES:
        # keep text before the first number/strength, e.g. "Ibuprofen 200 MG ..." -> "Ibuprofen"
        name = re.split(r"\s+\d", name, maxsplit=1)[0]
        name = re.split(r"[\[\(]", name, maxsplit=1)[0]
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    name = re.sub(r"\s+", " ", name).strip(" .")
    return name or "Unknown"


def digits(s):
    return re.sub(r"\D", "", str(s))


def read_table(path):
    if path.lower().endswith((".xlsx", ".xls")):
        return pd.read_excel(path, dtype=str)
    try:
        return pd.read_csv(path, dtype=str, encoding="utf-8-sig")
    except UnicodeDecodeError:
        return pd.read_csv(path, dtype=str, encoding="latin-1")


# ============================================================
# 1. INDEX IMAGES ON DISK
# ============================================================
print("Scanning:", IMAGE_DIR)
by_filename = {}   # "abc.jpg"  -> path
by_stem = {}       # "abc"      -> path
by_ndc = {}        # "00093005801" -> [paths]  (digits before first "_")

for root, _, files in os.walk(IMAGE_DIR):
    for f in files:
        stem, ext = os.path.splitext(f)
        if ext.lower() not in IMAGE_EXTENSIONS:
            continue
        p = os.path.join(root, f)
        by_filename[f.lower()] = p
        by_stem[stem.lower()] = p
        ndc = digits(stem.split("_")[0])
        if ndc:
            by_ndc.setdefault(ndc, []).append(p)

print(f"Images on disk: {len(by_filename)}")
if not by_filename:
    raise SystemExit("No images found - check IMAGE_DIR.")


# ============================================================
# 2. READ TABLE + DETECT COLUMNS
# ============================================================
df = read_table(TABLE_FILE)
print(f"Rows: {len(df)}")
print("Columns:", list(df.columns))

cols = {c: str(c).strip().lower() for c in df.columns}

name_col = next((c for c, l in cols.items() if l == "name"), None)
if name_col is None:
    name_col = next((c for c, l in cols.items() if "name" in l), None)
if name_col is None:
    raise SystemExit("Could not find a 'name' column.")

image_cols = [c for c, l in cols.items()
              if any(k in l for k in ("image", "rxbase", "rxnav", "file"))]
ndc_cols = [c for c, l in cols.items() if "ndc" in l]

print("Name column  :", name_col)
print("Image columns:", image_cols)
print("NDC columns  :", ndc_cols)


# ============================================================
# 3. LOCATE IMAGE FOR A ROW
# ============================================================
def find_images(row):
    found = []

    # a) explicit filename / path columns (exact match only)
    for c in image_cols:
        v = row[c]
        if pd.isna(v) or not str(v).strip():
            continue
        fname = os.path.basename(str(v).replace("\\", "/").split("?")[0]).strip()
        if not fname:
            continue
        p = by_filename.get(fname.lower()) or by_stem.get(os.path.splitext(fname)[0].lower())
        if p:
            found.append(p)

    # b) fallback: NDC match (only if nothing found yet)
    if not found:
        for c in ndc_cols:
            v = row[c]
            if pd.isna(v):
                continue
            d = digits(v)
            if len(d) >= 9:
                found.extend(by_ndc.get(d, []))
    return found


# ============================================================
# 4. COPY INTO CLASS FOLDERS
# ============================================================
os.makedirs(OUTPUT_DIR, exist_ok=True)

class_counts = {}
seen = set()            # (class, source_path) -> no duplicates inside a class
missing_rows = []
copied = 0

for idx, row in df.iterrows():
    if pd.isna(row[name_col]):
        continue
    cls = clean_name(row[name_col])
    paths = find_images(row)

    if not paths:
        missing_rows.append(row.to_dict())
        continue

    cls_dir = os.path.join(OUTPUT_DIR, cls)
    os.makedirs(cls_dir, exist_ok=True)

    for src in paths:
        key = (cls, os.path.normcase(os.path.abspath(src)))
        if key in seen:
            continue
        seen.add(key)

        n = class_counts.get(cls, 0) + 1
        ext = os.path.splitext(src)[1].lower()
        try:
            shutil.copy2(src, os.path.join(cls_dir, f"{cls[:40]}_{n:05d}{ext}"))
            class_counts[cls] = n
            copied += 1
        except Exception as e:
            print("Copy error:", src, e)


# ============================================================
# 5. REMOVE TINY CLASSES + REPORT
# ============================================================
removed = 0
if MIN_IMAGES_PER_CLASS > 1:
    for cls, n in list(class_counts.items()):
        if n < MIN_IMAGES_PER_CLASS:
            shutil.rmtree(os.path.join(OUTPUT_DIR, cls), ignore_errors=True)
            copied -= n
            removed += 1
            del class_counts[cls]

if missing_rows:
    miss_path = os.path.join(ROOT_DIR, "missing_images.csv")
    pd.DataFrame(missing_rows).to_csv(miss_path, index=False)
    print("Rows with no image saved to:", miss_path)

print("\n" + "=" * 60)
print("DATASET CREATION COMPLETE")
print("=" * 60)
print(f"Rows processed      : {len(df)}")
print(f"Classes (medicines) : {len(class_counts)}")
print(f"Images copied       : {copied}")
print(f"Rows without image  : {len(missing_rows)}")
if removed:
    print(f"Tiny classes removed: {removed}")
print(f"Output              : {OUTPUT_DIR}")

top = sorted(class_counts.items(), key=lambda x: -x[1])[:10]
print("\nLargest classes:")
for k, v in top:
    print(f"  {k}: {v}")