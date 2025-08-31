FROM python:3.11-slim

# Install curl for debugging
RUN apt-get update && apt-get install -y curl

# Create a non-root user
RUN useradd -m appuser

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app

# Change ownership of the app directory
RUN chown -R appuser:appuser /app

USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
