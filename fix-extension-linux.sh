#!/bin/bash

# 🔧 Claude VSCode Controller - Extension Fix for Linux (Updated)
# Naprawia Extension Host crashes, TypeScript errors i 404 błędy z marketplace

echo "🔧 Claude VSCode Controller - Extension Fix for Linux (v2)"
echo "========================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Stop VSCode and remove broken extension
log_step "Stopping VSCode processes and removing broken extension..."

# Kill VSCode processes
pkill -f "code" 2>/dev/null || true
sleep 2

# Remove broken extension
EXTENSION_DIR="$HOME/.vscode/extensions/claude-mcp-controller"
if [ -d "$EXTENSION_DIR" ]; then
    log_warning "Removing broken extension..."
    rm -rf "$EXTENSION_DIR"
fi

# Step 2: Clean and rebuild TypeScript
log_step "Cleaning and rebuilding TypeScript with fixed types..."

# Clean previous build
rm -rf out/
rm -rf node_modules/

# Install dependencies
log_step "Installing dependencies..."
if npm install; then
    log_success "Dependencies installed"
else
    log_error "Failed to install dependencies"
    exit 1
fi

# Build with fixed TypeScript types
log_step "Compiling TypeScript with hybrid import/require pattern..."
if npm run build; then
    log_success "TypeScript compiled successfully with fixed types"
else
    log_error "TypeScript compilation failed"
    echo ""
    echo "🔍 Common TypeScript issues on Linux:"
    echo "   - Type definitions missing: npm install @types/ws @types/node"
    echo "   - Permission issues: check file permissions"
    echo "   - Version conflicts: try npm install --force"
    exit 1
fi

# Verify the new compilation
if [ -f "out/extension.js" ]; then
    # Check compilation method
    if grep -q "require.*ws" out/extension.js; then
        log_success "Extension uses require('ws') for runtime - good for Linux!"
    fi
    if grep -q "typeof.*WebSocket" out/extension.js; then
        log_success "Extension uses proper TypeScript types - compilation successful!"
    fi
    
    # Check file size (should be reasonable)
    SIZE=$(du -k "out/extension.js" | cut -f1)
    if [ "$SIZE" -gt 5 ] && [ "$SIZE" -lt 1000 ]; then
        log_success "Extension size reasonable: ${SIZE}KB"
    else
        log_warning "Extension size unusual: ${SIZE}KB"
    fi
else
    log_error "Extension compilation failed - out/extension.js not found"
    exit 1
fi

# Step 3: Prepare extension with bundled dependencies
log_step "Preparing extension with bundled dependencies..."

# Create temporary directory for extension build
TEMP_EXT_DIR="/tmp/claude-mcp-controller-build"
rm -rf "$TEMP_EXT_DIR"
mkdir -p "$TEMP_EXT_DIR"

# Copy extension files
cp package-extension.json "$TEMP_EXT_DIR/package.json"
cp -r out "$TEMP_EXT_DIR/"

# Install only production dependencies in extension directory
cd "$TEMP_EXT_DIR"
if npm install --production --no-optional; then
    log_success "Extension dependencies installed"
else
    log_warning "Some dependencies failed to install, continuing..."
fi
cd - > /dev/null

# Step 4: Install the fixed extension
log_step "Installing fixed extension to VSCode..."

# Create VSCode extension directory
mkdir -p "$HOME/.vscode/extensions"
cp -r "$TEMP_EXT_DIR" "$EXTENSION_DIR"

# Clean up temp directory
rm -rf "$TEMP_EXT_DIR"

if [ -f "$EXTENSION_DIR/out/extension.js" ]; then
    log_success "Fixed extension installed successfully"
    
    # Set proper permissions
    chmod -R 755 "$EXTENSION_DIR"
    
else
    log_error "Failed to install fixed extension"
    exit 1
fi

# Step 5: Create comprehensive test script
log_step "Creating extension test script..."

cat > test-extension-comprehensive.sh << 'EOF'
#!/bin/bash
echo "🧪 Comprehensive VSCode Extension Test (Linux)"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_test() {
    echo -e "${YELLOW}🧪 $1${NC}"
}

log_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_fail() {
    echo -e "${RED}❌ $1${NC}"
}

# Test 1: Extension files exist
log_test "Testing extension installation..."
if [ -f "$HOME/.vscode/extensions/claude-mcp-controller/out/extension.js" ]; then
    log_pass "Extension files exist"
else
    log_fail "Extension files missing"
    exit 1
fi

# Test 2: Dependencies exist
log_test "Testing extension dependencies..."
if [ -d "$HOME/.vscode/extensions/claude-mcp-controller/node_modules/ws" ]; then
    log_pass "WebSocket module found"
else
    log_fail "WebSocket module missing - may cause runtime errors"
fi

# Test 3: Start VSCode in safe mode first
log_test "Starting VSCode in safe mode..."
code --disable-extensions . &
VSCODE_PID=$!
sleep 5

if ps -p $VSCODE_PID > /dev/null; then
    log_pass "VSCode started successfully in safe mode"
    
    # Kill safe mode VSCode
    kill $VSCODE_PID 2>/dev/null
    sleep 3
else
    log_fail "VSCode failed to start in safe mode"
    exit 1
fi

# Test 4: Start VSCode with extensions
log_test "Starting VSCode with extensions enabled..."
code . &
VSCODE_PID=$!
sleep 8

if ps -p $VSCODE_PID > /dev/null; then
    log_pass "VSCode started with extensions"
    echo ""
    echo "🔍 Manual checks needed:"
    echo "   1. Check VSCode Developer Tools: Help > Toggle Developer Tools"
    echo "   2. Look in Console tab for Extension Host errors"
    echo "   3. Check Extensions panel - Claude MCP Controller should be listed"
    echo "   4. Try: Ctrl+Shift+P > 'Start Claude MCP Bridge'"
    echo "   5. Status bar should show: '🤖 Claude MCP: Online'"
    echo ""
    echo "📊 Extension Host checks:"
    echo "   - No 'Extension Host is unresponsive' messages"
    echo "   - No 404 marketplace errors"
    echo "   - No WebSocket import errors"
    echo ""
    echo "✨ If you see '🤖 Claude MCP: Online' in status bar, the fix worked!"
    
else
    log_fail "VSCode failed to start with extensions"
    exit 1
fi
EOF

chmod +x test-extension-comprehensive.sh

# Step 6: Create quick debug script
cat > debug-extension.sh << 'EOF'
#!/bin/bash
echo "🔍 Extension Debug Information"
echo "============================="

EXTENSION_DIR="$HOME/.vscode/extensions/claude-mcp-controller"

echo "📁 Extension Directory:"
ls -la "$EXTENSION_DIR/"

echo ""
echo "📦 Extension Dependencies:"
ls -la "$EXTENSION_DIR/node_modules/" 2>/dev/null || echo "No node_modules directory"

echo ""
echo "🔍 Extension.js Content Check:"
if grep -q "require.*ws" "$EXTENSION_DIR/out/extension.js"; then
    echo "✅ Uses require('ws') - good for Linux"
else
    echo "❌ Doesn't use require('ws') - potential issue"
fi

if grep -q "WebSocketServer" "$EXTENSION_DIR/out/extension.js"; then
    echo "✅ WebSocketServer found in code"
else
    echo "❌ WebSocketServer not found in code"
fi

echo ""
echo "📊 Extension Size:"
du -h "$EXTENSION_DIR/out/extension.js"

echo ""
echo "🔧 VSCode Extension Status:"
if pgrep -f "code" > /dev/null; then
    echo "✅ VSCode is running"
else
    echo "❌ VSCode is not running"
fi

echo ""
echo "🌐 Port 3333 Status:"
if netstat -tulpn 2>/dev/null | grep -q ":3333"; then
    echo "✅ Port 3333 is in use (Bridge active)"
else
    echo "❌ Port 3333 is free (Bridge not active)"
fi
EOF

chmod +x debug-extension.sh

# Step 7: Final verification
log_step "Final verification..."

echo "📊 Extension installation summary:"
echo "   📁 Location: $EXTENSION_DIR"
echo "   📄 Main file: $(ls -lh "$EXTENSION_DIR/out/extension.js" 2>/dev/null || echo "NOT FOUND")"
echo "   📦 Dependencies: $(ls "$EXTENSION_DIR/node_modules/" 2>/dev/null | wc -l) modules"

echo ""
echo "🔍 Code verification:"
if grep -q "require.*ws" "$EXTENSION_DIR/out/extension.js"; then
    log_success "✅ Uses require('ws') - Linux compatible"
else
    log_warning "⚠️  Doesn't use require('ws') - may have issues"
fi

# Final instructions
echo ""
log_success "🎉 Extension fix completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. 🧪 Run comprehensive test: ./test-extension-comprehensive.sh"
echo "2. 🔍 Check debug info: ./debug-extension.sh"
echo "3. 🚀 Start VSCode and check Extension Host logs"
echo "4. ⚙️  Try activating bridge: Ctrl+Shift+P > 'Start Claude MCP Bridge'"
echo "5. 📊 Look for '🤖 Claude MCP: Online' in status bar"
echo ""
echo "🔧 If Extension Host still crashes:"
echo "   - Check VSCode Output > Extension Host for specific errors"
echo "   - Try: Help > Reload Window"
echo "   - Check file permissions: chmod -R 755 $EXTENSION_DIR"
echo ""
log_success "Extension should now work properly on Linux Ubuntu 24! 🐧✅"
