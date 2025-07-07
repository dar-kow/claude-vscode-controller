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
