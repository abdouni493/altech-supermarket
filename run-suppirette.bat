@echo off
REM run-suppirette.bat — starts backend and frontend, then opens browser
SET SCRIPT_DIR=%~dp0

REM Start backend server
start "Suppirette - Server" cmd /k "cd /d "%SCRIPT_DIR%server" && node index.js"

REM Start frontend (Vite)
start "Suppirette - Frontend" cmd /k "cd /d "%SCRIPT_DIR%" && npm run dev"

REM Wait for dev server to start (adjust time if needed)
timeout /t 8 /nobreak

REM Open browser - Vite will use the first available port starting from 5173
REM Open localhost:5173 (user will see the actual port in browser)
start http://localhost:5173

exit /b 0
