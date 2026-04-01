@echo off
setlocal
echo.
echo  ====================================
echo   FlightSight v2 - Starting App
echo  ====================================
echo.
cd /d "%~dp0backend"
echo Installing backend packages...
call npm.cmd install
echo.
echo Installing frontend packages...
cd /d "%~dp0frontend"
call npm.cmd install
echo.
echo Building frontend for single-host mode...
call npm.cmd run build
echo.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do set EXISTING_PID=%%a
if defined EXISTING_PID (
  echo Stopping existing app on http://localhost:3001  (PID: %EXISTING_PID%)
  taskkill /PID %EXISTING_PID% /F >nul 2>&1
  timeout /t 2 >nul
)
cd /d "%~dp0backend"
echo Starting single-host app...
echo Open browser at: http://localhost:3001
echo.
node server.js
pause
