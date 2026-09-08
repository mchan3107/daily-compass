$ErrorActionPreference = "Stop"

$Container = "daily-compass"
$removed = docker rm -f $Container 2>$null
if ($LASTEXITCODE -eq 0 -and $removed) {
    Write-Host "Stopped Daily Compass."
} else {
    Write-Host "Daily Compass is not running."
}
