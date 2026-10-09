@echo off
title MediGuide AI - One-Click Launcher
echo ===================================================
echo       Launching MediGuide AI Full Stack System
echo ===================================================
echo.

if exist "%~dp0.env" (
    echo [*] Loading local configuration from .env...
    for /f "usebackq tokens=*" %%i in ("%~dp0.env") do set "%%i"
)

echo [1/4] Starting Local MongoDB Database (Port 27017)...
start "MediGuide - MongoDB Database (Port 27017)" cmd /k "cd /d %~dp0 && mongod.exe --dbpath local_data\db --port 27017 --bind_ip 127.0.0.1"

echo [2/4] Starting Python NLP Microservice (Port 8000)...
start "MediGuide - Python NLP Service (Port 8000)" cmd /k "cd /d %~dp0backend\python-service && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [3/4] Starting Spring Boot Java Backend (Port 8080)...
start "MediGuide - Spring Boot Backend (Port 8080)" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo [4/4] Starting React Vite Frontend (Port 5173)...
start "MediGuide - React Frontend (Port 5173)" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ===================================================
echo All services launched!
echo Open your browser at: http://localhost:5173
echo ===================================================
ping -n 6 127.0.0.1 >nul
start http://localhost:5173
