# ===================================================
# Stock Manager V1 - Windows PowerShell Startup Script
# ===================================================

Write-Host "🚀 Starting Stock Manager V1 Application..." -ForegroundColor Green
Write-Host "📍 Location: $PWD" -ForegroundColor Cyan

# Function to check if Node.js is installed
function Test-NodeJS {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Node.js not found!" -ForegroundColor Red
        Write-Host "📥 Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
    return $false
}

# Function to check if npm is available
function Test-NPM {
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Host "✅ NPM detected: v$npmVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ NPM not found!" -ForegroundColor Red
        return $false
    }
    return $false
}

# Function to install dependencies
function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error during dependency installation: $_" -ForegroundColor Red
        return $false
    }
}

# Function to check if dependencies are installed
function Test-Dependencies {
    if (Test-Path "node_modules") {
        Write-Host "✅ Dependencies found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  Dependencies not found" -ForegroundColor Yellow
        return $false
    }
}

# Function to kill existing Node.js processes
function Stop-ExistingProcesses {
    Write-Host "🔄 Checking for existing Node.js processes..." -ForegroundColor Yellow
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-Host "🛑 Stopping existing Node.js processes..." -ForegroundColor Yellow
            Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-Host "✅ Existing processes stopped" -ForegroundColor Green
        } else {
            Write-Host "✅ No existing Node.js processes found" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️  Could not check/stop existing processes: $_" -ForegroundColor Yellow
    }
}

# Function to find available port
function Find-AvailablePort {
    $startPort = 5173
    $maxPort = 5200
    
    for ($port = $startPort; $port -le $maxPort; $port++) {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if (-not $connection) {
            Write-Host "✅ Found available port: $port" -ForegroundColor Green
            return $port
        }
    }
    
    Write-Host "⚠️  No available ports found in range $startPort-$maxPort" -ForegroundColor Yellow
    return $startPort
}

# Function to start development server
function Start-DevServer {
    Write-Host "🌐 Starting development server..." -ForegroundColor Yellow
    try {
        # Start npm dev server
        npm run dev
    }
    catch {
        Write-Host "❌ Error starting development server: $_" -ForegroundColor Red
        return $false
    }
}

# Function to open browser
function Open-Browser {
    param($port)
    
    $url = "http://localhost:$port"
    Write-Host "🌐 Opening browser at: $url" -ForegroundColor Cyan
    
    try {
        Start-Process $url
    }
    catch {
        Write-Host "⚠️  Could not open browser automatically. Please navigate to: $url" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "🔍 Performing system checks..." -ForegroundColor Cyan

# Check Node.js
if (-not (Test-NodeJS)) {
    Read-Host "Press Enter to exit"
    exit 1
}

# Check NPM
if (-not (Test-NPM)) {
    Read-Host "Press Enter to exit"
    exit 1
}

# Check and install dependencies
if (-not (Test-Dependencies)) {
    Write-Host "📦 Dependencies not found. Installing..." -ForegroundColor Yellow
    if (-not (Install-Dependencies)) {
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "📦 Dependencies already installed" -ForegroundColor Green
}

# Stop existing processes
Stop-ExistingProcesses

# Find available port
$availablePort = Find-AvailablePort

Write-Host ""
Write-Host "🎉 All checks passed! Starting Stock Manager V1..." -ForegroundColor Green
Write-Host "📱 Application will be available at: http://localhost:$availablePort" -ForegroundColor Cyan
Write-Host "⚠️  To stop the server, press Ctrl+C in this window" -ForegroundColor Yellow
Write-Host ""

# Wait a moment before starting
Start-Sleep -Seconds 2

# Start the development server
Start-DevServer

Write-Host ""
Write-Host "👋 Thanks for using Stock Manager V1!" -ForegroundColor Green
