@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Para abrir o Pauta, instale o Node.js LTS em https://nodejs.org
  echo Depois volte e abra este arquivo novamente.
  pause
  exit /b 1
)
node scripts\serve.cjs --open
if errorlevel 1 pause
endlocal
