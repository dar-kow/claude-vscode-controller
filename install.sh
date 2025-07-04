#!/bin/bash
#
# Claude VSCode Controller - One-Click Unix/Linux/macOS Installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/dar-kow/claude-vscode-controller/main/install.sh | bash
#
# Options:
#   INSTALL_PATH - Installation directory (default: ~/claude-vscode-controller)
#   FORCE - Overwrite existing installation (set to 1)
#   NO_START - Don't auto-start VSCode (set to 1)
#   BRANCH - Git branch to install (default: main)

set -e

# Configuration
INSTALL_PATH="${INSTALL_PATH:-$HOME/claude-vscode-controller}"
FORCE="${FORCE:-0}"
NO_START="${NO_START:-0}"
BRANCH="${BRANCH:-main}"
REPO_URL="https://github.com/dar-kow/claude-vscode-controller.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
log_step() {
    echo -e "${BLUE}🔹 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${CYAN}💡 $1${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Installation failed!"
        log_info "Check the logs above for details"
        log_info "For help, visit: https://github.com/dar-kow/claude-vscode-controller/issues"
    fi
}

trap cleanup EXIT

# Header
clear
cat << "EOF"
Claude VSCode Controller - One-Click Installer
==============================================

Transform your coding workflow with Claude Desktop!
EOF

echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    CLAUDE_CONFIG_DIR="$HOME/.config/Claude"
else
    log_error "Unsupported operating system: $OSTYPE"
    exit 1
fi

log_success "Detected OS: $OS"

# Step 1: Check Prerequisites
log_step "Checking system requirements..."

# Check Node.js
if ! command_exists node; then
    log_error "Node.js is not installed!"
    log_warning "Please install Node.js from https://nodejs.org/"
    log_warning "Minimum version: Node.js 18.0.0"
    if [[ "$OS" == "macOS" ]]; then
        log_info "macOS: brew install node"
    else
        log_info "Linux: Use your package manager or NodeSource repository"
    fi
    exit 1
fi

NODE_VERSION=$(node --version)
log_success "Node.js version: $NODE_VERSION"

# Check npm
if ! command_exists npm; then
    log_error "npm is not available!"
    exit 1
fi

NPM_VERSION=$(npm --version)
log_success "npm version: $NPM_VERSION"

# Check VSCode
if ! command_exists code; then
    log_error "VSCode is not installed or not in PATH!"
    log_warning "Please install VSCode from https://code.visualstudio.com/"
    if [[ "$OS" == "macOS" ]]; then
        log_info "macOS: After installing, run 'Shell Command: Install code command in PATH' from VSCode"
    else
        log_info "Linux: Make sure VSCode is added to PATH"
    fi
    exit 1
fi

VSCODE_VERSION=$(code --version | head -n1)
log_success "VSCode version: $VSCODE_VERSION"

# Check Git
if ! command_exists git; then
    log_error "Git is not installed!"
    if [[ "$OS" == "macOS" ]]; then
        log_info "macOS: brew install git"
    else
        log_info "Linux: sudo apt install git (Ubuntu/Debian) or sudo yum install git (CentOS/RHEL)"
    fi
    exit 1
fi

GIT_VERSION=$(git --version)
log_success "Git version: $GIT_VERSION"

echo ""

# Step 2: Setup Installation Directory
log_step "Setting up installation directory..."

if [ -d "$INSTALL_PATH" ]; then
    if [ "$FORCE" = "1" ]; then
        log_warning "Removing existing installation..."
        rm -rf "$INSTALL_PATH"
    else
        log_error "Installation directory already exists: $INSTALL_PATH"
        log_warning "Set FORCE=1 to overwrite existing installation"
        exit 1
    fi
fi

mkdir -p "$INSTALL_PATH"
cd "$INSTALL_PATH"
log_success "Installation directory: $INSTALL_PATH"

# Step 3: Clone Repository
log_step "Downloading Claude VSCode Controller..."

if ! git clone "$REPO_URL" . --branch "$BRANCH" --depth 1; then
    log_error "Failed to clone repository"
    exit 1
fi

log_success "Repository cloned successfully"

# Step 4: Install Dependencies
log_step "Installing Node.js dependencies..."

if ! npm install --production; then
    log_error "Failed to install dependencies"
    exit 1
fi

log_success "Dependencies installed successfully"

# Step 5: Build Extension
log_step "Building VSCode extension..."

# Install TypeScript if not available
if ! command_exists tsc; then
    log_warning "Installing TypeScript globally..."
    npm install -g typescript
fi

# Compile TypeScript
if ! npx tsc -p .; then
    log_error "Failed to compile TypeScript"
    exit 1
fi

if [ ! -f "out/extension.js" ]; then
    log_error "Extension compilation failed - out/extension.js not found"
    exit 1
fi

log_success "Extension built successfully"

# Step 6: Install VSCode Extension
log_step "Installing VSCode extension..."

EXTENSION_PATH="$HOME/.vscode/extensions/claude-mcp-controller"

# Remove existing extension
if [ -d "$EXTENSION_PATH" ]; then
    rm -rf "$EXTENSION_PATH"
fi

# Create extension directory
mkdir -p "$EXTENSION_PATH"

# Copy extension files
cp package.json "$EXTENSION_PATH/"
cp -r out "$EXTENSION_PATH/"

log_success "VSCode extension installed"

# Step 7: Configure Claude Desktop
log_step "Configuring Claude Desktop..."

CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create Claude config directory if it doesn't exist
mkdir -p "$CLAUDE_CONFIG_DIR"

# Read existing config or create new
if [ -f "$CLAUDE_CONFIG_FILE" ] && [ -s "$CLAUDE_CONFIG_FILE" ]; then
    # Backup existing config
    cp "$CLAUDE_CONFIG_FILE" "$CLAUDE_CONFIG_FILE.backup.$(date +%s)"
    log_info "Backed up existing Claude config"
fi

# Create new config with vscode-controller
cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "vscode-controller": {
      "command": "node",
      "args": ["$INSTALL_PATH/enhanced-mcp-server.js"],
      "env": {
        "NODE_ENV": "production",
        "VSCODE_BRIDGE": "enabled"
      }
    }
  }
}
EOF

log_success "Claude Desktop configured"
log_success "Config file: $CLAUDE_CONFIG_FILE"

# Step 8: Create Start Scripts
log_step "Creating convenience scripts..."

# Create start-bridge.sh
cat > start-bridge.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Claude VSCode Controller Bridge..."
echo "📁 Project: $(pwd)"

# Check if VSCode is running
if ! pgrep -f "Visual Studio Code" > /dev/null && ! pgrep -f "code" > /dev/null; then
    echo "❌ VSCode is not running!"
    echo "💡 Please start VSCode first"
    read -p "Press Enter to continue..."
    exit 1
fi

# Start MCP Server
echo "🔌 Starting MCP Server..."
node enhanced-mcp-server.js
EOF

chmod +x start-bridge.sh

# Create test-connection.sh
cat > test-connection.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing Claude VSCode Controller..."
node quick-test.js
EOF

chmod +x test-connection.sh

log_success "Convenience scripts created"

# Step 9: Final Instructions
echo ""
log_success "🎉 Installation Complete!"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Start VSCode:"
echo "   code ."
echo ""
echo "2. Activate VSCode Bridge:"
echo "   - Press Cmd+Shift+P (macOS) or Ctrl+Shift+P (Linux)"
echo "   - Type: 'Start Claude MCP Bridge'"
echo "   - Look for 'Claude MCP: Online' in status bar"
echo ""
echo "3. Start MCP Server:"
echo "   ./start-bridge.sh"
echo ""
echo "4. Test connection:"
echo "   ./test-connection.sh"
echo ""
echo "5. Restart Claude Desktop to load new configuration"
echo ""

echo -e "${BLUE}📁 Installation Location:${NC}"
echo "$INSTALL_PATH"
echo ""

echo -e "${BLUE}🔧 Configuration Files:${NC}"
echo "VSCode Extension: $HOME/.vscode/extensions/claude-mcp-controller"
echo "Claude Config: $CLAUDE_CONFIG_FILE"
echo ""

# Auto-start VSCode if requested
if [ "$NO_START" != "1" ]; then
    echo -e "${YELLOW}Press Enter to start VSCode or Ctrl+C to exit...${NC}"
    read -r
    
    # Open VSCode in project directory
    code .
    
    echo ""
    log_success "🚀 VSCode started! Follow steps 2-5 above to complete setup."
fi

echo ""
echo -e "${CYAN}Need help? Check the README.md or create an issue on GitHub!${NC}"
echo "GitHub: https://github.com/dar-kow/claude-vscode-controller"

# Remove trap to indicate successful completion
trap - EXIT
