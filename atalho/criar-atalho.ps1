$ErrorActionPreference = "Stop"

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$bat = Join-Path $here "Iniciar Pauta.bat"
$ico = Join-Path $here "Pauta.ico"

if (-not (Test-Path -LiteralPath $bat)) {
  throw "Nao achei o iniciador: $bat"
}

$desktop = [Environment]::GetFolderPath("Desktop")
if (-not $desktop) {
  throw "Nao achei a area de trabalho do Windows."
}

$lnk = Join-Path $desktop "Pauta.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnk)
$shortcut.TargetPath = $bat
$shortcut.WorkingDirectory = $env:USERPROFILE
$shortcut.WindowStyle = 1
$shortcut.Description = "Pauta - leitura e polirritmos"
if (Test-Path -LiteralPath $ico) {
  $shortcut.IconLocation = "$ico,0"
}
$shortcut.Save()

Write-Host "Atalho criado: $lnk"
