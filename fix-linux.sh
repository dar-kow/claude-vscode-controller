#!/bin/bash

# 🐧 Claude VSCode Controller - Linux Ubuntu 24 Quick Fix
# Automatyczne naprawienie wszystkich problemów

echo "🐧 Claude VSCode Controller - Linux Ubuntu 24 Quick Fix"
echo "======================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Step 1: Install dependencies
log_step "Installing Node.js dependencies..."
if npm install; then
    log_success "Dependencies installed successfully"
else
    log_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Build TypeScript
log_step "Compiling TypeScript..."
if npm run build; then
    log_success "TypeScript compiled successfully"
else
    log_error "TypeScript compilation failed"
    exit 1
fi

# Step 3: Verify build output
if [ -f "out/extension.js" ]; then
    log_success "Extension compiled: out/extension.js"
    ls -la out/
else
    log_error "Extension compilation failed - out/extension.js not found"
    exit 1
fi

# Step 4: Install VSCode extension
log_step "Installing VSCode extension..."

# Create extension directory
EXTENSION_DIR="$HOME/.vscode/extensions/claude-mcp-controller"
if [ -d "$EXTENSION_DIR" ]; then
    log_warning "Removing existing extension..."
    rm -rf "$EXTENSION_DIR"
fi

mkdir -p "$EXTENSION_DIR"

# Copy extension files
cp package-extension.json "$EXTENSION_DIR/package.json" 2>/dev/null || {
    # If package-extension.json doesn't exist, create it from package.json
    log_warning "package-extension.json not found, creating from package.json..."
    
    # Create a basic VSCode extension package.json
    cat > "$EXTENSION_DIR/package.json" << 'EOF'
{
  "name": "claude-mcp-controller",
  "displayName": "Claude MCP Controller",
  "description": "Control VSCode from Claude Desktop",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onStartupFinished"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "claude-mcp.start",
        "title": "Start Claude MCP Bridge"
      },
      {
        "command": "claude-mcp.stop",
        "title": "Stop Claude MCP Bridge"
      }
    ]
  }
}
EOF
}

# Copy compiled extension
cp -r out "$EXTENSION_DIR/"

if [ -f "$EXTENSION_DIR/out/extension.js" ]; then
    log_success "VSCode extension installed successfully"
else
    log_error "Failed to install VSCode extension"
    exit 1
fi

# Step 5: Configure Claude Desktop
log_step "Configuring Claude Desktop..."

CLAUDE_CONFIG_DIR="$HOME/.config/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Create Claude config directory
mkdir -p "$CLAUDE_CONFIG_DIR"

# Get absolute path to enhanced-mcp-server.js
PROJECT_PATH=$(pwd)
MCP_SERVER_PATH="$PROJECT_PATH/enhanced-mcp-server.js"

if [ ! -f "$MCP_SERVER_PATH" ]; then
    log_error "enhanced-mcp-server.js not found at $MCP_SERVER_PATH"
    exit 1
fi

# Backup existing config if it exists
if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    BACKUP_FILE="$CLAUDE_CONFIG_FILE.backup.$(date +%s)"
    cp "$CLAUDE_CONFIG_FILE" "$BACKUP_FILE"
    log_warning "Backed up existing config to: $BACKUP_FILE"
fi

# Create Claude Desktop configuration
cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "vscode-controller": {
      "command": "node",
      "args": ["$MCP_SERVER_PATH"],
      "env": {
        "NODE_ENV": "production",
        "VSCODE_BRIDGE": "enabled"
      }
    }
  }
}
EOF

log_success "Claude Desktop configured: $CLAUDE_CONFIG_FILE"

# Step 6: Create startup scripts
log_step "Creating startup scripts..."

# Create start-bridge.sh
cat > start-bridge.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Claude VSCode Controller Bridge..."
echo "📁 Project: $(pwd)"

# Check if VSCode is running
if ! pgrep -f "code" > /dev/null; then
    echo "❌ VSCode is not running!"
    echo "💡 Please start VSCode first: code ."
    read -p "Press Enter to continue..."
    exit 1
fi

# Start MCP Server
echo "🔌 Starting MCP Server..."
node enhanced-mcp-server.js
EOF

chmod +x start-bridge.sh

# Create test script
cat > test-connection.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing Claude VSCode Controller..."

# Test if port 3333 is available
if nc -z localhost 3333 2>/dev/null; then
    echo "✅ Port 3333 is open - Bridge is active!"
else
    echo "❌ Port 3333 is closed - Bridge is not active"
    echo "💡 Start VSCode and activate the bridge first"
fi

# Test WebSocket connection
if command -v curl >/dev/null 2>&1; then
    echo "🔌 Testing WebSocket connection..."
    timeout 5 curl -i -N -H "Connection: Upgrade" \
         -H "Upgrade: websocket" \
         -H "Sec-WebSocket-Key: test" \
         -H "Sec-WebSocket-Version: 13" \
         http://localhost:3333 2>/dev/null && echo "✅ WebSocket test successful" || echo "❌ WebSocket test failed"
fi
EOF

chmod +x test-connection.sh

log_success "Startup scripts created"

# Step 7: Run basic diagnostics
log_step "Running basic diagnostics..."

echo "📊 System Information:"
echo "  OS: $(uname -s) $(uname -r)"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"

if command -v code >/dev/null 2>&1; then
    echo "  VSCode: $(code --version | head -n1)"
else
    log_warning "VSCode not found in PATH"
fi

echo ""
echo "📁 Installation paths:"
echo "  Project: $PROJECT_PATH"
echo "  MCP Server: $MCP_SERVER_PATH"
echo "  VSCode Extension: $EXTENSION_DIR"
echo "  Claude Config: $CLAUDE_CONFIG_FILE"

# Final instructions
echo ""
log_success "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. 🚀 Start VSCode: code ."
echo "2. 🔌 Activate bridge: Ctrl+Shift+P → 'Start Claude MCP Bridge'"
echo "3. ✅ Check status bar: Should show '🤖 Claude MCP: Online'"
echo "4. ▶️  Start MCP Server: ./start-bridge.sh"
echo "5. 🧪 Test connection: ./test-connection.sh"
echo "6. 🔄 Restart Claude Desktop to load new configuration"
echo ""
echo "🎯 Test in Claude Desktop:"
echo '   "Show me workspace info"'
echo '   "Create a test file"'
echo ""
log_success "Ready to use Claude VSCode Controller on Linux! 🐧🤖"
