@echo off
echo ========================================================
echo       DOCVAULT - PERSONAL DOCUMENT ORGANIZER (MERN)
echo ========================================================
echo.
echo Starting MongoDB Backend on Port 5050...
start cmd /k "cd backend && npm start"

timeout /t 2 /nobreak >nul

echo Starting React Frontend on Port 3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Application started!
echo Frontend URL: http://localhost:3000
echo Backend API:  http://localhost:5050/api
echo.
echo Demo Credentials:
echo   - User:  user@example.com   / user123
echo   - Admin: admin@example.com  / admin123
echo ========================================================
pause
