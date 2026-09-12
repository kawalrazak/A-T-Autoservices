# A&T Auto Services Website

Local preview for the A&T Auto Services website.

## Requirements

- [Python 3.8+](https://www.python.org/downloads/) installed on your PC
- During Python install, check **"Add Python to PATH"**

## Quick Start (Windows)

### Option 1 — Double-click (easiest)

1. Double-click **`run.bat`**
2. Open your browser to **http://localhost:8080**

### Option 2 — PowerShell

```powershell
cd "d:\Kanwal\A&T-Autoservices"
.\run.ps1
```

### Option 3 — Manual steps

```powershell
# 1. Go to project folder
cd "d:\Kanwal\A&T-Autoservices"

# 2. Create virtual environment (first time only)
python -m venv venv

# 3. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 4. Start local server
python -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

## Stop the server

Press **Ctrl + C** in the terminal window.

## Project structure

```
A&T-Autoservices/
├── index.html          # Main page
├── css/style.css       # Styles
├── js/main.js          # Scripts
├── images/             # Logo & photos
├── venv/               # Python virtual environment (auto-created)
├── run.bat             # One-click start (Windows)
├── run.ps1             # One-click start (PowerShell)
└── requirements.txt
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `python` not found | Reinstall Python and enable "Add to PATH" |
| Port 8080 in use | Change `8080` to `3000` in `run.bat` / `run.ps1` |
| PowerShell script blocked | Run: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
