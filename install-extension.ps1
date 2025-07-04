#!/usr/bin/env powershell

# 🚀 Claude VSCode Controller - Automatyczna Instalacja
# Skrypt dla Windows PowerShell

Write-Host "🚀 Claude VSCode Controller - Instalacja" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Sprawdź wymagania
Write-Host "📋 Sprawdzanie wymagań..." -ForegroundColor Yellow

# Sprawdź Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nie jest zainstalowany!" -ForegroundColor Red
    exit 1
}

# Sprawdź VSCode
try {
    $vscodeVersion = code --version | Select-Object -First 1
    Write-Host "✅ VSCode: $vscodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ VSCode nie jest zainstalowany lub nie ma w PATH!" -ForegroundColor Red
    exit 1
}

# Sprawdź czy jesteśmy w prawidłowym katalogu
if (!(Test-Path "package.json") -or !(Test-Path "out\extension.js")) {
    Write-Host "❌ Uruchom skrypt w katalogu projektu!" -ForegroundColor Red
    Write-Host "📍 Katalog powinien zawierać package.json i out/extension.js" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Wszystkie wymagania spełnione!" -ForegroundColor Green

# Zaktualizuj package.json jeśli potrzeba
Write-Host "📝 Sprawdzanie package.json..." -ForegroundColor Yellow
$packageContent = Get-Content "package.json" -Raw | ConvertFrom-Json

if (-not $packageContent.publisher) {
    Write-Host "⚠️  Dodawanie publisher do package.json..." -ForegroundColor Yellow
    $packageContent | Add-Member -Type NoteProperty -Name "publisher" -Value "claude-vscode-team" -Force
    $packageContent | ConvertTo-Json -Depth 10 | Set-Content "package.json"
}

# Sprawdź czy rozszerzenie jest już zainstalowane
Write-Host "🔍 Sprawdzanie istniejącej instalacji..." -ForegroundColor Yellow
$extensionsPath = "$env:USERPROFILE\.vscode\extensions"
$targetPath = "$extensionsPath\claude-mcp-controller"

if (Test-Path $targetPath) {
    Write-Host "⚠️  Znaleziono poprzednią instalację. Usuwanie..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $targetPath
}

# Stwórz folder rozszerzenia
Write-Host "📁 Tworzenie folderu rozszerzenia..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $targetPath | Out-Null

# Kopiuj potrzebne pliki
Write-Host "📋 Kopiowanie plików..." -ForegroundColor Yellow

$filesToCopy = @(
    @{Source = "package.json"; Required = $true},
    @{Source = "out"; Required = $true},
    @{Source = "node_modules"; Required = $true},
    @{Source = "README.md"; Required = $false},
    @{Source = "CHANGELOG.md"; Required = $false}
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file.Source) {
        Write-Host "  ➤ Kopiowanie $($file.Source)..." -ForegroundColor Cyan
        Copy-Item -Path $file.Source -Destination $targetPath -Recurse -Force
    } elseif ($file.Required) {
        Write-Host "❌ Wymagany plik nie istnieje: $($file.Source)" -ForegroundColor Red
        exit 1
    }
}

# Sprawdź czy VSCode jest uruchomiony
Write-Host "🔄 Sprawdzanie VSCode..." -ForegroundColor Yellow
$vscodeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue

if ($vscodeProcesses) {
    Write-Host "⚠️  VSCode jest uruchomiony. Zamykanie..." -ForegroundColor Yellow
    $vscodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 3
}

Write-Host "✅ Rozszerzenie zainstalowane!" -ForegroundColor Green
Write-Host "📍 Lokalizacja: $targetPath" -ForegroundColor Cyan

# Uruchom VSCode
Write-Host "🚀 Uruchamianie VSCode..." -ForegroundColor Yellow
Start-Process "code" -ArgumentList "."

# Czekaj na uruchomienie VSCode
Start-Sleep -Seconds 5

# Sprawdź czy rozszerzenie jest załadowane
Write-Host "🔍 Weryfikacja instalacji..." -ForegroundColor Yellow

$maxRetries = 10
$retryCount = 0

do {
    $extensions = & code --list-extensions 2>$null
    $found = $extensions | Where-Object { $_ -like "*claude*" }
    
    if ($found) {
        Write-Host "✅ Rozszerzenie znalezione: $found" -ForegroundColor Green
        break
    }
    
    $retryCount++
    Write-Host "⏳ Próba $retryCount/$maxRetries - czekam na załadowanie rozszerzenia..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
} while ($retryCount -lt $maxRetries)

if ($retryCount -eq $maxRetries) {
    Write-Host "⚠️  Nie udało się zweryfikować automatycznie, ale rozszerzenie zostało skopiowane." -ForegroundColor Yellow
}

# Instrukcje testowe
Write-Host "" -ForegroundColor White
Write-Host "🎉 INSTALACJA ZAKOŃCZONA!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📋 Jak testować:" -ForegroundColor Yellow
Write-Host "1. W VSCode naciśnij Ctrl+Shift+P" -ForegroundColor White
Write-Host "2. Wpisz 'Claude MCP' - powinny pojawić się komendy" -ForegroundColor White
Write-Host "3. Wybierz 'Start Claude MCP Bridge'" -ForegroundColor White
Write-Host "4. Na dole VSCode powinien pojawić się status: 🤖 Claude MCP: Online" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Test WebSocket:" -ForegroundColor Yellow
Write-Host "netstat -an | findstr :3333" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🎯 Następny krok: Skonfiguruj MCP Server dla Claude Desktop" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

# Sprawdź status portu
Write-Host "🔍 Sprawdzanie portu 3333..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$portCheck = netstat -an | findstr ":3333"
if ($portCheck) {
    Write-Host "✅ Port 3333 jest aktywny!" -ForegroundColor Green
    Write-Host "$portCheck" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Port 3333 nie jest jeszcze aktywny. Uruchom 'Start Claude MCP Bridge' w VSCode." -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "🚀 Gotowe! Miłego korzystania z Claude VSCode Controller!" -ForegroundColor Green