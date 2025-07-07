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
