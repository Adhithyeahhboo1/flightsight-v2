@echo off
setlocal
echo.
echo  =====================================
echo   FlightSight v2 - Building Frontend
echo  =====================================
echo.
cd /d "%~dp0frontend"
echo Installing packages...
call npm.cmd install
echo.
echo Building frontend assets...
call npm.cmd run build
echo.
echo Frontend build complete.
echo Use START_BACKEND.bat to serve the full app on http://localhost:3001
echo.
pause
