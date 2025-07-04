#!/usr/bin/env pwsh

Write-Host "Claude VSCode Controller - Auto Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Sprawdz czy VSCode jest zainstalowany
Write-Host "Sprawdzanie VSCode..." -ForegroundColor Yellow
try {
    $vscodeVersion = code --version 2>$null
    if ($vscodeVersion) {
        Write-Host "VSCode jest zainstalowany" -ForegroundColor Green
        Write-Host "   Wersja: $($vscodeVersion[0])" -ForegroundColor Gray
    } else {
        Write-Host "VSCode nie jest zainstalowany lub nie ma w PATH!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Nie mozna sprawdzic VSCode!" -ForegroundColor Red
    exit 1
}

# Sprawdz zainstalowane rozszerzenia
Write-Host "Sprawdzanie rozszen VSCode..." -ForegroundColor Yellow
try {
    $extensions = code --list-extensions 2>$null
    $claudeExtension = $extensions | Where-Object { $_ -like "*claude*" -or $_ -like "*mcp*" }
    
    if ($claudeExtension) {
        Write-Host "Znaleziono rozszerzenie Claude MCP:" -ForegroundColor Green
        Write-Host "   $claudeExtension" -ForegroundColor Gray
    } else {
        Write-Host "Rozszerzenie Claude MCP nie jest zainstalowane!" -ForegroundColor Red
        Write-Host "Proba instalacji rozszerzenia..." -ForegroundColor Yellow
        
        # Sprawdz czy istnieje folder rozszerzenia w projekcie
        $extensionPath = "$env:USERPROFILE\.vscode\extensions\claude-mcp-controller"
        if (Test-Path $extensionPath) {
            Write-Host "Folder rozszerzenia istnieje: $extensionPath" -ForegroundColor Green
        } else {
            Write-Host "Folder rozszerzenia nie istnieje!" -ForegroundColor Red
            Write-Host "Tworzenie folderu rozszerzenia..." -ForegroundColor Yellow
            
            # Skopiuj rozszerzenie z projektu (jesli istnieje w out/)
            if (Test-Path "out\extension.js") {
                New-Item -ItemType Directory -Force -Path $extensionPath | Out-Null
                Copy-Item "package.json" -Destination $extensionPath -Force
                Copy-Item "out\*" -Destination "$extensionPath\out\" -Recurse -Force
                Write-Host "Rozszerzenie skopiowane!" -ForegroundColor Green
            } else {
                Write-Host "Pliki rozszerzenia nie sa skompilowane!" -ForegroundColor Red
                Write-Host "Kompilowanie rozszerzenia..." -ForegroundColor Yellow
                
                if (Test-Path "src\extension.ts") {
                    # Sprawdz czy TypeScript jest zainstalowany
                    try {
                        $tscVersion = tsc --version 2>$null
                        if ($tscVersion) {
                            Write-Host "TypeScript: $tscVersion" -ForegroundColor Green
                            
                            # Kompiluj rozszerzenie
                            tsc -p .
                            
                            if (Test-Path "out\extension.js") {
                                Write-Host "Rozszerzenie skompilowane!" -ForegroundColor Green
                                
                                # Skopiuj do folderu rozszen
                                New-Item -ItemType Directory -Force -Path $extensionPath | Out-Null
                                Copy-Item "package.json" -Destination $extensionPath -Force
                                Copy-Item "out\*" -Destination "$extensionPath\out\" -Recurse -Force
                                Write-Host "Rozszerzenie zainstalowane!" -ForegroundColor Green
                            } else {
                                Write-Host "Kompilacja nie powiodla sie!" -ForegroundColor Red
                            }
                        } else {
                            Write-Host "TypeScript nie jest zainstalowany!" -ForegroundColor Red
                            Write-Host "Instalowanie TypeScript..." -ForegroundColor Yellow
                            npm install -g typescript
                        }
                    } catch {
                        Write-Host "Blad podczas kompilacji: $($_.Exception.Message)" -ForegroundColor Red
                    }
                } else {
                    Write-Host "Brak plikow zrodlowych rozszerzenia!" -ForegroundColor Red
                }
            }
        }
    }
} catch {
    Write-Host "Blad podczas sprawdzania rozszen: $($_.Exception.Message)" -ForegroundColor Red
}

# Sprawdz czy VSCode jest uruchomiony
Write-Host "Sprawdzanie procesow VSCode..." -ForegroundColor Yellow
$vscodeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if ($vscodeProcesses) {
    Write-Host "VSCode jest uruchomiony ($($vscodeProcesses.Count) procesow)" -ForegroundColor Green
    
    # Sprawdz port 3333
    Write-Host "Sprawdzanie portu 3333..." -ForegroundColor Yellow
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port 3333 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            Write-Host "Port 3333 jest otwarty - Bridge dziala!" -ForegroundColor Green
        } else {
            Write-Host "Port 3333 jest zamkniety!" -ForegroundColor Red
            Write-Host "URUCHOM BRIDGE W VSCODE:" -ForegroundColor Yellow
            Write-Host "   1. Nacisnij Ctrl+Shift+P" -ForegroundColor White
            Write-Host "   2. Wpisz 'Start Claude MCP Bridge'" -ForegroundColor White
            Write-Host "   3. Sprawdz status bar: 'Claude MCP: Online'" -ForegroundColor White
        }
    } catch {
        Write-Host "Nie mozna sprawdzic portu: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "VSCode nie jest uruchomiony!" -ForegroundColor Red
    Write-Host "Uruchom VSCode przed kontynuowaniem" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "NASTEPNE KROKI:" -ForegroundColor Cyan
Write-Host "1. Uruchom VSCode (jesli nie jest uruchomiony)" -ForegroundColor White
Write-Host "2. Nacisnij Ctrl+Shift+P" -ForegroundColor White
Write-Host "3. Wpisz 'Start Claude MCP Bridge'" -ForegroundColor White
Write-Host "4. Sprawdz status bar: 'Claude MCP: Online'" -ForegroundColor White
Write-Host "5. Uruchom: node enhanced-mcp-server.js" -ForegroundColor White
Write-Host "6. Przetestuj w Claude Desktop" -ForegroundColor White

Write-Host ""
Write-Host "Po uruchomieniu Bridge, uruchom enhanced-mcp-server.js" -ForegroundColor Green