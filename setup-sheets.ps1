# PowerShell script untuk setup Google Sheets
# File: setup-sheets.ps1

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "verify", "info", "help")]
    [string]$Command = "help"
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

function Write-ColorText {
    param($Text, $Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Show-Header {
    Write-ColorText "🚀 Google Sheets Setup Tool for StockManager" $Blue
    Write-ColorText "=" * 50 $Blue
    Write-Host ""
}

function Show-Help {
    Show-Header
    Write-ColorText "Commands:" $Yellow
    Write-ColorText "  setup   - Create missing sheets and populate with template data" $White
    Write-ColorText "  verify  - Check which sheets exist and their data" $White
    Write-ColorText "  info    - Show spreadsheet information" $White
    Write-ColorText "  help    - Show this help message" $White
    Write-Host ""
    Write-ColorText "Examples:" $Yellow
    Write-ColorText "  .\setup-sheets.ps1 setup" $White
    Write-ColorText "  .\setup-sheets.ps1 verify" $White
    Write-Host ""
    Write-ColorText "Prerequisites:" $Yellow
    Write-ColorText "  ✅ Node.js installed" $White
    Write-ColorText "  ✅ 'googleapis' npm package installed" $White
    Write-ColorText "  ✅ service-account-key.json file in project folder" $White
    Write-ColorText "  ✅ Spreadsheet shared with service account email" $White
    Write-Host ""
}

function Test-Prerequisites {
    Write-ColorText "🔍 Checking prerequisites..." $Cyan
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-ColorText "✅ Node.js: $nodeVersion" $Green
    } catch {
        Write-ColorText "❌ Node.js not found. Please install Node.js first." $Red
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-ColorText "✅ npm: $npmVersion" $Green
    } catch {
        Write-ColorText "❌ npm not found" $Red
        return $false
    }
    
    # Check googleapis package
    if (Test-Path "node_modules\googleapis") {
        Write-ColorText "✅ googleapis package installed" $Green
    } else {
        Write-ColorText "⚠️ googleapis package not found. Installing..." $Yellow
        npm install googleapis
        if ($LASTEXITCODE -eq 0) {
            Write-ColorText "✅ googleapis installed successfully" $Green
        } else {
            Write-ColorText "❌ Failed to install googleapis" $Red
            return $false
        }
    }
    
    # Check service account key
    if (Test-Path "service-account-key.json") {
        Write-ColorText "✅ service-account-key.json found" $Green
    } else {
        Write-ColorText "❌ service-account-key.json not found" $Red
        Write-ColorText "📝 Please create service account key file:" $Yellow
        Write-ColorText "   1. Go to Google Cloud Console > IAM & Admin > Service Accounts" $White
        Write-ColorText "   2. Create new service account or select existing" $White
        Write-ColorText "   3. Create key (JSON format)" $White
        Write-ColorText "   4. Save as 'service-account-key.json' in this folder" $White
        Write-ColorText "   5. Share your spreadsheet with the service account email" $White
        return $false
    }
    
    # Check setup script
    if (Test-Path "setup-sheets-auto.js") {
        Write-ColorText "✅ setup-sheets-auto.js found" $Green
    } else {
        Write-ColorText "❌ setup-sheets-auto.js not found" $Red
        return $false
    }
    
    Write-Host ""
    return $true
}

function Run-Setup {
    Show-Header
    Write-ColorText "🚀 Starting Google Sheets setup..." $Blue
    
    if (-not (Test-Prerequisites)) {
        Write-ColorText "❌ Prerequisites check failed. Please fix the issues above." $Red
        return
    }
    
    Write-ColorText "🛠️ Running setup script..." $Cyan
    node setup-sheets-auto.js setup
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-ColorText "🎉 Setup completed successfully!" $Green
        Write-ColorText "📋 Next steps:" $Yellow
        Write-ColorText "  1. Open your spreadsheet and verify the data" $White
        Write-ColorText "  2. Run your app: npm run dev" $White
        Write-ColorText "  3. Login with Google and check Debug page" $White
    } else {
        Write-ColorText "❌ Setup failed. Check the error messages above." $Red
    }
}

function Run-Verify {
    Show-Header
    Write-ColorText "🔍 Verifying Google Sheets..." $Blue
    
    if (-not (Test-Prerequisites)) {
        Write-ColorText "❌ Prerequisites check failed. Please fix the issues above." $Red
        return
    }
    
    Write-ColorText "🔍 Running verification..." $Cyan
    node setup-sheets-auto.js verify
}

function Run-Info {
    Show-Header
    Write-ColorText "📋 Getting spreadsheet info..." $Blue
    
    if (-not (Test-Prerequisites)) {
        Write-ColorText "❌ Prerequisites check failed. Please fix the issues above." $Red
        return
    }
    
    Write-ColorText "📊 Getting info..." $Cyan
    node setup-sheets-auto.js info
}

# Main execution
switch ($Command) {
    "setup" {
        Run-Setup
    }
    "verify" {
        Run-Verify
    }
    "info" {
        Run-Info
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}

Write-Host ""
Write-ColorText "Done! 🚀" $Green
