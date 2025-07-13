# ===================================================
# Stock Manager V1 - Windows PowerShell Startup Script (Fixed)
# ===================================================

param(
    [switch]$SkipChecks = $false
)

# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "========================================"
Write-Host "  Stock Manager V1 - Startup Script"
Write-Host "========================================"
Write-Host ""

# Function to write colored output
function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Success" { Write-Host "[OK] $Message" -ForegroundColor Green }
        "Error" { Write-Host "[ERROR] $Message" -ForegroundColor Red }
        "Warning" { Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
        "Info" { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
        default { Write-Host $Message }
    }
}

# Function to check if Node.js is installed
function Test-NodeJS {
    Write-Host "[1/5] Checking Node.js installation..."
    try {
        $nodeVersion = & node --version 2>$null
        if ($LASTEXITCODE -eq 0 -and $nodeVersion) {
            Write-Status "Node.js detected: $nodeVersion" "Success"
            return $true
        }
    }
    catch {
        Write-Status "Node.js not found!" "Error"
        Write-Status "Please install Node.js from: https://nodejs.org/" "Info"
        return $false
    }
    return $false
}

# Function to check if npm is available
function Test-NPM {
    Write-Host "[2/5] Checking NPM installation..."
    try {
        $npmVersion = & npm --version 2>$null
        if ($LASTEXITCODE -eq 0 -and $npmVersion) {
            Write-Status "NPM detected: v$npmVersion" "Success"
            return $true
        }
    }
    catch {
        Write-Status "NPM not found!" "Error"
        return $false
    }
    return $false
}

# Function to install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..." "Info"
    try {
        & npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Dependencies installed successfully!" "Success"
            return $true
        } else {
            Write-Status "Failed to install dependencies!" "Error"
            return $false
        }
    }
    catch {
        Write-Status "Error during dependency installation: $($_.Exception.Message)" "Error"
        return $false
    }
}

# Function to check if dependencies are installed
function Test-Dependencies {
    Write-Host "[4/5] Checking dependencies..."
    if (Test-Path "node_modules") {
        Write-Status "Dependencies found" "Success"
        return $true
    } else {
        Write-Status "Dependencies not found" "Warning"
        return $false
    }
}

# Function to kill existing Node.js processes
function Stop-ExistingProcesses {
    Write-Host "[3/5] Checking for existing Node.js processes..."
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-Status "Stopping existing Node.js processes..." "Warning"
            Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-Status "Existing processes stopped" "Success"
        } else {
            Write-Status "No existing Node.js processes found" "Success"
        }
    }
    catch {
        Write-Status "Could not check/stop existing processes: $($_.Exception.Message)" "Warning"
    }
}

# Function to start development server
function Start-DevServer {
    Write-Host "[5/5] Starting Stock Manager V1..."
    Write-Host ""
    Write-Status "All checks passed!" "Success"
    Write-Status "Application will start at: http://localhost:5173 (or next available port)" "Info"
    Write-Status "To stop the server, press Ctrl+C in this window" "Warning"
    Write-Host ""
    Write-Status "Starting development server..." "Info"
    Write-Host ""
    
    try {
        # Start npm dev server
        & npm run dev
    }
    catch {
        Write-Status "Error starting development server: $($_.Exception.Message)" "Error"
        return $false
    }
}

# Main execution
try {
    if (-not $SkipChecks) {
        Write-Status "Performing system checks..." "Info"

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

        # Stop existing processes
        Stop-ExistingProcesses

        # Check and install dependencies
        if (-not (Test-Dependencies)) {
            Write-Status "Dependencies not found. Installing..." "Info"
            if (-not (Install-Dependencies)) {
                Read-Host "Press Enter to exit"
                exit 1
            }
        }
    }

    # Start the development server
    Start-DevServer
}
catch {
    Write-Status "An unexpected error occurred: $($_.Exception.Message)" "Error"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Status "Thanks for using Stock Manager V1!" "Success"
