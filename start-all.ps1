# Start both servers
$ErrorActionPreference = "Continue"

Write-Host "Starting Bridge Server..."
Start-Process -FilePath "node" -ArgumentList "packages\bridge\dist\cli.js","serve" -WorkingDirectory "C:\Users\5 de julio\office-agents" -NoNewWindow -PassThru

Start-Sleep -Seconds 3

Write-Host "Starting Dev Server..."
Start-Process -FilePath "npx" -ArgumentList "vite","--port","3000","--host","127.0.0.1" -WorkingDirectory "C:\Users\5 de julio\office-agents\packages\excel" -NoNewWindow -PassThru

Start-Sleep -Seconds 10

Write-Host "Both servers should be running now."
Write-Host "Bridge: https://localhost:4017"
Write-Host "Dev Server: https://localhost:3000"
Write-Host ""
Write-Host "Reloading Excel add-in..."
& "C:\Users\5 de julio\office-agents\node_modules\.pnpm\node_modules\.bin\office-addin-dev-settings.CMD" sideload "C:\Users\5 de julio\office-agents\packages\excel\manifest.xml" --app Excel

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Checking bridge sessions..."
node "C:\Users\5 de julio\office-agents\packages\bridge\dist\cli.js" list