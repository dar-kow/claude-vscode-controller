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
