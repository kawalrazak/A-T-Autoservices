@echo off
cd /d "%~dp0"

echo ============================================
echo   A&T Auto Services - Local Dev Server
echo ============================================
echo.

if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create venv. Make sure Python 3 is installed.
        pause
        exit /b 1
    )
    echo Virtual environment created.
    echo.
)

call venv\Scripts\activate.bat

echo Starting server at http://localhost:8080
echo Press Ctrl+C to stop.
echo.

python -m http.server 8080
