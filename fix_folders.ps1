# PowerShell script to fix the folder structure
$source = "src/app/api/apps/[id]"
$temp = "src/app/api/apps/[appId]_temp"
$dest = "src/app/api/apps/[appId]"

# Create temp directory if it doesn't exist
if (-not (Test-Path -Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force
}

# Copy contents from [id] to [appId]
if (Test-Path -Path $source) {
    Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
    
    # Remove the old [id] directory
    Remove-Item -Path $source -Recurse -Force
    
    Write-Host "Successfully moved contents from [id] to [appId]"
} else {
    Write-Host "Source directory $source does not exist"
}
