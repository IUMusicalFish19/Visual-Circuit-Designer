# backend/dockerfile

FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Копируем всю папку backend в контейнер
COPY . ./backend

CMD ["uvicorn", "backend.profile.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]