import os
import platform
import re
import shutil
from typing import Any, Dict, List

from PIL import Image, ImageOps
import pytesseract


def _configure_tesseract_path() -> None:
    """
    Resolve the Tesseract executable, in order of priority:
    1. An explicit TESSERACT_CMD environment variable, if set — the most
       reliable option, since it removes all guessing.
    2. Whatever `tesseract` resolves to on the system PATH.
    3. Common Windows install locations, including per-user installs (the
       UB Mannheim installer's "install for me only" option puts it under
       the user's AppData rather than Program Files).
    """
    explicit = os.environ.get("TESSERACT_CMD")
    if explicit and os.path.isfile(explicit):
        pytesseract.pytesseract.tesseract_cmd = explicit
        return

    if shutil.which("tesseract"):
        return

    if platform.system() == "Windows":
        candidates = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
            os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
            os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
        ]
        for path in candidates:
            if os.path.isfile(path):
                pytesseract.pytesseract.tesseract_cmd = path
                return


_configure_tesseract_path()


class OCREngine:
    """
    Real OCR engine for packaged-commodity label inspection.

    Uses Tesseract (via pytesseract) to extract text from an uploaded
    package image, then applies regex-based heuristics to pull out the
    specific Legal-Metrology fields the rule engine checks for.

    Runs OCR twice — once on the original image, once on a lightly
    enhanced (grayscale/contrast/upscaled) version — and merges whichever
    pass successfully finds each field. Real-world label photos are
    inconsistent enough (angle, lighting, focus) that no single
    preprocessing choice reliably wins on every field, so this ensemble
    approach is meaningfully more robust than either pass alone.

    This is still a prototype-grade extraction layer: it works very well
    on clear, well-lit label photos and reasonably on typical phone-camera
    shots, but (like any OCR pipeline) accuracy depends on image quality.
    Fields that can't be confidently located are left as null, which
    correctly triggers the relevant compliance rule as "not detected"
    rather than guessing.
    """

    def process_image(self, image_path: str) -> Dict[str, Any]:
        image = Image.open(image_path).convert("RGB")

        # Pass 1: OCR on the original image, plus word-level confidence/boxes
        raw_text_original = pytesseract.image_to_string(image)
        word_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        raw_ocr: List[Dict[str, Any]] = []
        confidences: List[float] = []

        for i, text in enumerate(word_data.get("text", [])):
            text = text.strip()
            conf_raw = word_data["conf"][i]
            try:
                conf = float(conf_raw)
            except (TypeError, ValueError):
                conf = -1.0
            if not text or conf < 0:
                continue
            x, y, w, h = (
                word_data["left"][i], word_data["top"][i],
                word_data["width"][i], word_data["height"][i],
            )
            raw_ocr.append({
                "text": text,
                "confidence": round(conf / 100.0, 2),
                "bounding_box": [x, y, x + w, y + h],
            })
            confidences.append(conf)

        readability_score = int(sum(confidences) / len(confidences)) if confidences else 0

        # Pass 2: OCR on a lightly enhanced version (helps on angled/low-contrast photos)
        try:
            enhanced = image.convert("L")
            enhanced = ImageOps.autocontrast(enhanced, cutoff=1)
            enhanced = enhanced.resize((enhanced.width * 2, enhanced.height * 2), Image.LANCZOS)
            raw_text_enhanced = pytesseract.image_to_string(enhanced)
        except Exception:
            raw_text_enhanced = ""

        fields_a = self._extract_fields(raw_text_original)
        fields_b = self._extract_fields(raw_text_enhanced)
        extracted_declarations = {
            key: (fields_a[key] if fields_a[key] else fields_b[key])
            for key in fields_a
        }

        return {
            "extracted_declarations": extracted_declarations,
            "raw_ocr": raw_ocr,
            "raw_text": raw_text_original,
            "readability_score": readability_score,
        }

    def _extract_fields(self, raw_text: str) -> Dict[str, Any]:
        text = raw_text.replace("\n", " ")
        fields: Dict[str, Any] = {
            "manufacturer": None,
            "net_quantity": None,
            "mrp": None,
            "packing_date": None,
            "consumer_care": None,
            "country_of_origin": None,
        }

        m = re.search(
            r"(?:Manufactured|Mfd|Marketed)\s*(?:by)?\s*[:\-]?\s*"
            r"(.{4,200}?)"
            r"(?:Net\s*Qu?a?n?ti?t?y?|MRP|M\.?R\.?P|Pack(?:ed|ing)?|"
            r"Consumer\s*Care|Country\s*of\s*Origin|M[ft]g\.?\s*(?:Date|Lic)|$)",
            text, re.IGNORECASE,
        )
        if m:
            fields["manufacturer"] = m.group(1).strip(" .,-")

        m = re.search(
            r"Net\s*(?:Qty|Quantity|Wt|Weight)?\.?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(g|kg|ml|l)\b",
            text, re.IGNORECASE,
        )
        if m:
            fields["net_quantity"] = f"{m.group(1)} {m.group(2).lower()}"

        # Allow for the standard "MRP (incl. of all taxes)" style phrasing that
        # sits between the label and the actual number on real Indian packaging.
        m = re.search(
            r"(?:MRP|M\.?R\.?P\.?)[^\d₹]{0,40}?(?:Rs\.?|Ps\.?|₹|INR)?\s*(\d+(?:\.\d+)?)",
            text, re.IGNORECASE,
        )
        if m:
            fields["mrp"] = f"Rs. {m.group(1)}"

        # "Mfg" is commonly misread by OCR as "Mtg" (f/t confusion) — accept both.
        m = re.search(
            r"(?:Packed|Pkd|M[ft]g|Manufacturing)\.?\s*(?:on|date)?\s*[:\-]?\s*"
            r"(\d{1,2}/\d{2,4}(?:/\d{2,4})?)",
            text, re.IGNORECASE,
        )
        if m:
            fields["packing_date"] = m.group(1)

        m = re.search(
            r"Consumer\s*Care\s*[:\-]?\s*([\d\-\+\s]{7,15})",
            text, re.IGNORECASE,
        )
        if m:
            fields["consumer_care"] = m.group(1).strip()

        m = re.search(
            r"Country\s*of\s*Origin\s*[:\-]?\s*([A-Za-z]{3,30})",
            text, re.IGNORECASE,
        )
        if m:
            fields["country_of_origin"] = m.group(1).strip()

        return fields


ocr_engine = OCREngine()
