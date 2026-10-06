@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0criar-atalho.ps1"
if errorlevel 1 (
  echo Nao consegui criar o atalho.
  pause
  exit /b 1
)
echo.
echo Pronto. O atalho Pauta esta na area de trabalho.
pause
