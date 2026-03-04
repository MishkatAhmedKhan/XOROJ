@echo off
setlocal

REM Get the absolute path to the project root (where this script is located)
set "PROJECT_ROOT=%~dp0"

echo Stopping any existing servers...

REM Kill process on port 8081 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill process on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%PROJECT_ROOT%backend" && mvnw.cmd spring-boot:run"

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%PROJECT_ROOT%frontend" && npm install && npm run dev"

echo Servers launched in new windows.
pause