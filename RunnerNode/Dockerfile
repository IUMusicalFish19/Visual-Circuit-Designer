FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    make \
    iverilog \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /RunnerNode
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "connect:socket_app", "--host", "0.0.0.0", "--port", "80", "--reload"]