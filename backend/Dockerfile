FROM python:3.11-slim

# Tesseract is a system program the OCR code calls out to — it has to be
# installed at the OS level, not via pip.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads

# Render (and most PaaS platforms) assign the port dynamically via $PORT.
# Locally (docker run without setting PORT) this defaults to 8000.
ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
