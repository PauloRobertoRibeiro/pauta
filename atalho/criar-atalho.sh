#!/usr/bin/env bash
# Cria o atalho Pauta na area de trabalho do Windows, a partir do WSL.
set -euo pipefail

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ps1="$dir/criar-atalho.ps1"

if ! command -v powershell.exe >/dev/null 2>&1; then
  echo "Abra o Explorador na pasta atalho e de dois cliques em: Criar atalho na area de trabalho.bat"
  exit 1
fi

win="$(wslpath -w "$ps1")"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$win"
