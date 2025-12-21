# Fetch weapon specialization icons from questlog.gg using Selenium
param(
    [int]$MaxPages = 13  # Based on the pagination shown
)

$ErrorActionPreference = "Continue"
$baseUrl = "https://questlog.gg/throne-and-liberty/en/db/weapon-specializations"
$assetsDir = "src\assets\icons\weapon-specializations"
$outputJson = "src\assets\weaponSpecializations.json"

# Create directory if it doesn't exist
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
    Write-Host "Created directory: $assetsDir" -ForegroundColor Green
}

Write-Host "Checking for Selenium WebDriver..." -ForegroundColor Cyan

# Check if Selenium module is installed
if (-not (Get-Module -ListAvailable -Name Selenium)) {
    Write-Host "Installing Selenium module..." -ForegroundColor Yellow
    Install-Module -Name Selenium -Force -Scope CurrentUser -AllowClobber
}

Import-Module Selenium

try {
    # Initialize Chrome driver
    Write-Host "Starting Chrome driver..." -ForegroundColor Cyan
    $driver = Start-SeDriver -Browser Chrome -StartURL "about:blank" -Quiet
    
    $allSkills = @{}
    
    for ($page = 1; $page -le $MaxPages; $page++) {
        Write-Host "`nFetching page $page..." -ForegroundColor Cyan
        
        $url = if ($page -eq 1) { $baseUrl } else { "$baseUrl`?page=$page" }
        
        try {
            # Navigate to page
            $driver.Navigate().GoToUrl($url)
            
            # Wait for content to load
            Start-Sleep -Seconds 3
            
            # Get the page HTML
            $html = $driver.PageSource
            
            # Find all skill rows in the table
            $rows = $driver.FindElements([OpenQA.Selenium.By]::XPath("//tr[contains(@class, 'hover:')]"))
            
            Write-Host "Found $($rows.Count) skill rows on page $page"
            
            foreach ($row in $rows) {
                try {
                    # Get skill name
                    $nameElements = $row.FindElements([OpenQA.Selenium.By]::TagName("span"))
                    $skillName = ""
                    foreach ($elem in $nameElements) {
                        $text = $elem.Text.Trim()
                        if ($text.Length -gt 0 -and $text -notmatch '^\d+$') {
                            $skillName = $text
                            break
                        }
                    }
                    
                    if ([string]::IsNullOrWhiteSpace($skillName)) {
                        continue
                    }
                    
                    # Get icon
                    $imgElement = $row.FindElements([OpenQA.Selenium.By]::TagName("img"))
                    $iconUrl = ""
                    if ($imgElement.Count -gt 0) {
                        $iconUrl = $imgElement[0].GetAttribute("src")
                    }
                    
                    # Get weapon and type from table cells
                    $cells = $row.FindElements([OpenQA.Selenium.By]::TagName("td"))
                    $weapon = if ($cells.Count -gt 1) { $cells[1].Text.Trim() } else { "" }
                    $skillType = if ($cells.Count -gt 2) { $cells[2].Text.Trim() } else { "" }
                    
                    # Get skill link
                    $linkElements = $row.FindElements([OpenQA.Selenium.By]::TagName("a"))
                    $skillLink = ""
                    if ($linkElements.Count -gt 0) {
                        $skillLink = $linkElements[0].GetAttribute("href")
                    }
                    
                    if ([string]::IsNullOrWhiteSpace($iconUrl)) {
                        Write-Host "  Skipping $skillName (no icon URL)" -ForegroundColor Yellow
                        continue
                    }
                    
                    # Download icon
                    $iconFileName = $skillName -replace '[\\/:*?"<>|]', '_'
                    $iconFileName = $iconFileName -replace '\s+', '-'
                    $iconFileName = "$iconFileName.webp"
                    $iconPath = Join-Path $assetsDir $iconFileName
                    
                    try {
                        if (-not (Test-Path $iconPath)) {
                            Invoke-WebRequest -Uri $iconUrl -OutFile $iconPath -UseBasicParsing -TimeoutSec 10
                            Write-Host "  Downloaded: $skillName" -ForegroundColor Green
                        } else {
                            Write-Host "  Already exists: $skillName" -ForegroundColor DarkGray
                        }
                        
                        # Add to skills collection
                        if (-not $allSkills.ContainsKey($skillName)) {
                            $allSkills[$skillName] = @{
                                name = $skillName
                                icon = "icons/weapon-specializations/$iconFileName"
                                weapon = $weapon
                                type = $skillType
                                questlogUrl = $skillLink
                                iconUrl = $iconUrl
                            }
                        }
                    }
                    catch {
                        Write-Host "  Failed to download icon for: $skillName - $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
                catch {
                    Write-Host "  Error processing row: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            
            Start-Sleep -Milliseconds 500  # Be respectful to the server
        }
        catch {
            Write-Host "Error fetching page $page`: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Convert to JSON and save
    Write-Host "`nSaving JSON file with $($allSkills.Count) skills..." -ForegroundColor Cyan
    $jsonOutput = $allSkills | ConvertTo-Json -Depth 10
    $jsonOutput | Out-File -FilePath $outputJson -Encoding UTF8
    
    Write-Host "`nComplete! Saved $($allSkills.Count) weapon specialization skills to $outputJson" -ForegroundColor Green
    Write-Host "Icons saved to: $assetsDir" -ForegroundColor Green
}
finally {
    # Clean up
    if ($driver) {
        Write-Host "`nClosing browser..." -ForegroundColor Cyan
        Stop-SeDriver -Driver $driver
    }
}
