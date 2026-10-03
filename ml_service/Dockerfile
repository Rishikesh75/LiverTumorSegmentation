FROM python:3.10-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PYTHONPATH=/app:/app/ml_service/app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY app/ ./ml_service/app/

RUN mkdir -p /app/ml_service/resources/uploads /app/ml_service/resources/outputs

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5001/health', timeout=5)" || exit 1

CMD ["uvicorn", "app:app", "--app-dir", "/app/ml_service/app", "--host", "0.0.0.0", "--port", "5001", "--log-level", "info"]

