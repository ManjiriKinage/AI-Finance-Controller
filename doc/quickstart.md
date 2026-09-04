# Quickstart

## Prerequisites

- Python 3.10 or newer
- Node.js and npm

## Run the application

Run the backend and frontend in two separate terminals.

Terminal 1:

```powershell
Set-Location "D:\projects2\AI Finance Controller"
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Terminal 2:

```powershell
Set-Location "D:\projects2\AI Finance Controller\frontend"
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Run the backend

From `D:\projects2\AI Finance Controller`:

```powershell
Set-Location "D:\projects2\AI Finance Controller"
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

The API is available at http://127.0.0.1:8000. The interactive API documentation is available at http://127.0.0.1:8000/docs.

## Run the frontend

From `D:\projects2\AI Finance Controller\frontend`:

```powershell
Set-Location "D:\projects2\AI Finance Controller\frontend"
npm install
npm run dev
```

Open the application at http://localhost:3000.

## Verify the backend

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/health
```

A healthy service returns HTTP status `200`.

## Stop the application

Press `Ctrl+C` in each terminal running the backend or frontend.
