Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "      Launching MediGuide AI Full Stack System     " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
$pathFix = "`$env:Path = 'C:\Users\Tamilini.S\miniforge3;C:\Users\Tamilini.S\miniforge3\Scripts;C:\Users\Tamilini.S\maven\apache-maven-3.9.10\bin;' + `$env:Path;"

Write-Host "`n[1/3] Starting Python NLP Microservice (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$pathFix Set-Location '$root\backend\python-service'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/3] Starting Spring Boot Java Backend (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$pathFix Set-Location '$root\backend'; mvn spring-boot:run"

Write-Host "[3/3] Starting React Vite Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$pathFix Set-Location '$root'; npm.cmd run dev"

Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "All services starting up! Opening browser in 5s..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
