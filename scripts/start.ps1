$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Image = "daily-compass"
$Container = "daily-compass"
$Port = 8080

$ParentEnv = Join-Path (Split-Path $Root) ".env"
$LocalEnv = Join-Path $Root ".env"
if (Test-Path $ParentEnv) {
    $EnvFile = $ParentEnv
} elseif (Test-Path $LocalEnv) {
    $EnvFile = $LocalEnv
} else {
    $EnvFile = ""
}

docker build -t $Image $Root
docker rm -f $Container 2>$null | Out-Null

if ($EnvFile -ne "") {
    docker run -d --name $Container -p "${Port}:8000" --env-file $EnvFile $Image | Out-Null
} else {
    docker run -d --name $Container -p "${Port}:8000" $Image | Out-Null
}

for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:${Port}/api/hello" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "Daily Compass is running at http://127.0.0.1:${Port}"
            exit 0
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

Write-Host "Container did not become ready."
docker logs $Container
exit 1
