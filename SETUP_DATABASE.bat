@echo off
echo.
echo  ====================================
echo   FlightSight v2 - Setup Database
echo  ====================================
echo.
echo This will create the flightsight database with users, favorites and all 48 flights.
echo.
set /p PASS=Enter your MySQL root password: 
echo.
echo Loading database...
mysql -u root -p%PASS% < "%~dp0backend\setup.sql"
echo.
echo  ========================================
echo   Done! Database is ready.
echo   Now double-click START_BACKEND.bat
echo  ========================================
echo.
pause
