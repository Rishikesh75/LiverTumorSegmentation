FROM python:3.10-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PYTHONPATH=/app:/app/ml_service/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-docker.txt ./requirements-docker.txt
RUN pip install --no-cache-dir -r requirements-docker.txt && \
    pip install --no-cache-dir --no-deps \
    --index-url https://download.pytorch.org/whl/cpu \
    "torch==2.5.1+cpu" && \
    rm -rf \
      /usr/local/lib/python3.10/site-packages/torch/include \
      /usr/local/lib/python3.10/site-packages/torch/test && \
    find /usr/local/lib/python3.10/site-packages \
      -type d -name __pycache__ -prune -exec rm -rf {} +

COPY app/ ./ml_service/app/

RUN if grep -q "^version https://git-lfs.github.com/spec/v1$" \
      /app/ml_service/app/ml_models/attention_unet_model.pth; then \
      echo "The model checkpoint is a Git LFS pointer. Check out the repository with LFS enabled." >&2; \
      exit 1; \
    fi && \
    mkdir -p /app/ml_service/resources/uploads /app/ml_service/resources/outputs

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5001/health', timeout=5)" || exit 1

CMD ["uvicorn", "app:app", "--app-dir", "/app/ml_service/app", "--host", "0.0.0.0", "--port", "5001", "--log-level", "info"]
