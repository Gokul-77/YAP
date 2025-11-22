@echo off
echo ========================================
echo YAP Frontend - Starting Vite Dev Server
echo ========================================
echo.

cd frontend

echo Installing @tailwindcss/postcss (if needed)...
call npm install @tailwindcss/postcss --silent

echo.
echo ========================================
echo Starting Vite server on http://localhost:5173
echo ========================================
echo.

call npm run dev
