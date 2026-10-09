@echo off
title DocVault - Setup and Launch
echo ========================================================
echo       DOCVAULT - PERSONAL DOCUMENT ORGANIZER (MERN)
echo                   FIRST-TIME SETUP
echo ========================================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
if not exist node_modules (
    call npm install
) else (
    echo Backend dependencies already installed.
)

echo.
echo [2/4] Seeding Database with Realistic Demo Data...
call npm run seed

echo.
echo [3/4] Installing Frontend Dependencies...
cd ..\frontend
if not exist node_modules (
    call npm install
) else (
    echo Frontend dependencies already installed.
)

cd ..
echo.
echo [4/4] Launching Application...
call run-project.bat
