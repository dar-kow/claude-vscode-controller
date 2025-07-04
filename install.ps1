#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Claude VSCode Controller - One-Click Windows Installer
.DESCRIPTION
    Automatically installs and configures Claude VSCode Controller with all dependencies
.EXAMPLE
    curl -fsSL https://raw.githubusercontent.com/dar-kow/claude-vscode-controller/main/install.ps1 | powershell -
#>

param(
    [string]$InstallPath = "$env:USERPROFILE\claude-vscode-controller",
    [switch]$Force,
    [switch]$NoStart,
    [string]$Branch = "main"
)

# Colors for output
function Write-Step($Message) {
    Write-Host "🔹 $Message" -ForegroundColor Blue
}

function Write-Success($Message) {
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error($Message) {
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning($Message) {
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Test-Command($Command) {
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Header
Clear-Host
Write-Host "Claude VSCode Controller - One-Click Installer" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Prerequisites
Write-Step "Checking system requirements..."

# Check Windows version
$osVersion = [Environment]::OSVersion.Version
if ($osVersion.Major -lt 10) {
    Write-Error "Windows 10 or higher is required!"
    exit 1
}
Write-Success "Windows version: $($osVersion.Major).$($osVersion.Minor)"

# Check Node.js
if (-not (Test-Command "node")) {
    Write-Error "Node.js is not installed!"
    Write-Warning "Please install Node.js from https://nodejs.org/"
    Write-Warning "Minimum version: Node.js 18.0.0"
    exit 1
}

$nodeVersion = node --version
Write-Success "Node.js version: $nodeVersion"

# Check VSCode
if (-not (Test-Command "code")) {
    Write-Error "VSCode is not installed or not in PATH!"
    Write-Warning "Please install VSCode from https://code.visualstudio.com/"
    Write-Warning "Make sure to add VSCode to PATH during installation"
    exit 1
}

$vscodeVersion = code --version | Select-Object -First 1
Write-Success "VSCode version: $vscodeVersion"

Write-Host ""

# Step 2: Setup Installation Directory
Write-Step "Setting up installation directory..."

if (Test-Path $InstallPath) {
    if ($Force) {
        Write-Warning "Removing existing installation..."
        Remove-Item -Path $InstallPath -Recurse -Force
    }
    else {
        Write-Error "Installation directory already exists: $InstallPath"
        Write-Warning "Use -Force parameter to overwrite existing installation"
        exit 1
    }
}

New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
Set-Location $InstallPath
Write-Success "Installation directory: $InstallPath"

# Step 3: Clone Repository
Write-Step "Downloading Claude VSCode Controller..."

try {
    git clone https://github.com/dar-kow/claude-vscode-controller.git . --branch $Branch --depth 1
    Write-Success "Repository cloned successfully"
}
catch {
    Write-Error "Failed to clone repository: $($_.Exception.Message)"
    exit 1
}

# Step 4: Install Dependencies
Write-Step "Installing Node.js dependencies..."

try {
    npm install --production
    Write-Success "Dependencies installed successfully"
}
catch {
    Write-Error "Failed to install dependencies: $($_.Exception.Message)"
    exit 1
}

# Step 5: Build Extension
Write-Step "Building VSCode extension..."

try {
    # Install TypeScript if not available
    if (-not (Test-Command "tsc")) {
        Write-Warning "Installing TypeScript globally..."
        npm install -g typescript
    }
    
    # Compile TypeScript
    tsc -p .
    
    if (-not (Test-Path "out\extension.js")) {
        throw "Extension compilation failed"
    }
    
    Write-Success "Extension built successfully"
}
catch {
    Write-Error "Failed to build extension: $($_.Exception.Message)"
    exit 1
}

# Step 6: Install VSCode Extension
Write-Step "Installing VSCode extension..."

try {
    $extensionPath = "$env:USERPROFILE\.vscode\extensions\claude-mcp-controller"
    
    # Remove existing extension
    if (Test-Path $extensionPath) {
        Remove-Item -Path $extensionPath -Recurse -Force
    }
    
    # Create extension directory
    New-Item -ItemType Directory -Path $extensionPath -Force | Out-Null
    
    # Copy extension files
    Copy-Item "package.json" -Destination $extensionPath -Force
    Copy-Item "out" -Destination $extensionPath -Recurse -Force
    
    Write-Success "VSCode extension installed"
}
catch {
    Write-Error "Failed to install VSCode extension: $($_.Exception.Message)"
    exit 1
}

# Step 7: Configure Claude Desktop
Write-Step "Configuring Claude Desktop..."

try {
    $claudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
    $claudeConfigDir = Split-Path $claudeConfigPath -Parent
    
    # Create Claude config directory if it doesn't exist
    if (-not (Test-Path $claudeConfigDir)) {
        New-Item -ItemType Directory -Path $claudeConfigDir -Force | Out-Null
    }
    
    # Read existing config or create new
    $config = @{}
    if (Test-Path $claudeConfigPath) {
        $configContent = Get-Content $claudeConfigPath -Raw
        if ($configContent.Trim() -ne "") {
            $config = $configContent | ConvertFrom-Json -AsHashtable
        }
    }
    
    # Ensure mcpServers exists
    if (-not $config.ContainsKey("mcpServers")) {
        $config["mcpServers"] = @{}
    }
    
    # Add vscode-controller configuration
    $config["mcpServers"]["vscode-controller"] = @{
        command = "node"
        args    = @("$InstallPath\enhanced-mcp-server.js")
        env     = @{
            NODE_ENV      = "production"
            VSCODE_BRIDGE = "enabled"
        }
    }
    
    # Save configuration
    $config | ConvertTo-Json -Depth 10 | Out-File $claudeConfigPath -Encoding UTF8
    
    Write-Success "Claude Desktop configured"
    Write-Success "Config file: $claudeConfigPath"
}
catch {
    Write-Error "Failed to configure Claude Desktop: $($_.Exception.Message)"
    exit 1
}

# Step 8: Create Start Scripts
Write-Step "Creating convenience scripts..."

# Create start-bridge.ps1
$startBridgeScript = @"
#!/usr/bin/env pwsh
Write-Host "🚀 Starting Claude VSCode Controller Bridge..." -ForegroundColor Green
Write-Host "📁 Project: $InstallPath" -ForegroundColor Gray

# Check if VSCode is running
`$vscodeProcess = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if (-not `$vscodeProcess) {
    Write-Host "❌ VSCode is not running!" -ForegroundColor Red
    Write-Host "💡 Please start VSCode first" -ForegroundColor Yellow
    pause
    exit 1
}

# Start MCP Server
Set-Location "$InstallPath"
Write-Host "🔌 Starting MCP Server..." -ForegroundColor Blue
node enhanced-mcp-server.js
"@

$startBridgeScript | Out-File "start-bridge.ps1" -Encoding UTF8

# Create test-connection.ps1
$testScript = @"
#!/usr/bin/env pwsh
Write-Host "🧪 Testing Claude VSCode Controller..." -ForegroundColor Green
Set-Location "$InstallPath"
node quick-test.js
"@

$testScript | Out-File "test-connection.ps1" -Encoding UTF8

Write-Success "Convenience scripts created"

# Step 9: Final Instructions
Write-Host ""
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start VSCode:" -ForegroundColor White
Write-Host "   code ." -ForegroundColor Gray
Write-Host ""
Write-Host "2. Activate VSCode Bridge:" -ForegroundColor White
Write-Host "   - Press Ctrl+Shift+P" -ForegroundColor Gray
Write-Host "   - Type: 'Start Claude MCP Bridge'" -ForegroundColor Gray
Write-Host "   - Look for 'Claude MCP: Online' in status bar" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start MCP Server:" -ForegroundColor White
Write-Host "   .\start-bridge.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test connection:" -ForegroundColor White
Write-Host "   .\test-connection.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Restart Claude Desktop to load new configuration" -ForegroundColor White
Write-Host ""

Write-Host "📁 Installation Location:" -ForegroundColor Blue
Write-Host "$InstallPath" -ForegroundColor Gray
Write-Host ""

if (-not $NoStart) {
    Write-Host "Press any key to start VSCode..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Open VSCode in project directory
    code .
    
    Write-Host ""
    Write-Host "🚀 VSCode started! Follow steps 2-5 above to complete setup." -ForegroundColor Green
}

Write-Host ""
Write-Host "Need help? Check the README.md or create an issue on GitHub!" -ForegroundColor Cyan
Write-Host "GitHub: https://github.com/dar-kow/claude-vscode-controller" -ForegroundColor Gray
