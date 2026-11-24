@echo off
title CivicSolve AI - Launcher
echo ========================================================
echo        CivicSolve AI - Full-Stack Application
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CivicSolve AI - Backend (Port 8000)" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
cd frontend
start "CivicSolve AI - Frontend (Port 5173)" cmd /k "npm run dev"

echo.
echo ========================================================
echo Both servers have been launched in separate windows!
echo Opening browser: http://localhost:5173
echo ========================================================
timeout /t 3 >nul
start http://localhost:5173
pause

