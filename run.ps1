Set-Location $PSScriptRoot

Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  A&T Auto Services - Local Dev Server" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create venv. Install Python 3 from https://python.org" -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created." -ForegroundColor Green
    Write-Host ""
}

& ".\venv\Scripts\Activate.ps1"

Write-Host "Starting server at http://localhost:8080" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

python -m http.server 8080
