@echo off
title MediGuide AI - One-Click Launcher
echo ===================================================
echo       Launching MediGuide AI Full Stack System
echo ===================================================
echo.

if exist "C:\Users\Tamilini.S\maven\apache-maven-3.9.10\bin" set "PATH=C:\Users\Tamilini.S\maven\apache-maven-3.9.10\bin;%PATH%"

echo [1/3] Starting Python NLP Microservice (Port 8000)...
start "MediGuide - Python NLP Service (Port 8000)" cmd /k "cd /d %~dp0backend\python-service && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Spring Boot Java Backend (Port 8080)...
start "MediGuide - Spring Boot Backend (Port 8080)" cmd /k "set PATH=C:\Users\Tamilini.S\maven\apache-maven-3.9.10\bin;%%PATH%% && cd /d %~dp0backend && mvn spring-boot:run"

echo [3/3] Starting React Vite Frontend (Port 5173)...
start "MediGuide - React Frontend (Port 5173)" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ===================================================
echo All services launched!
echo Open your browser at: http://localhost:5173
echo ===================================================
ping -n 5 127.0.0.1 >nul
start http://localhost:5173
