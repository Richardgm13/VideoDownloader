$timestamp = [int][double]::Parse((Get-Date -UFormat %s)) * 1000
Write-Output "Creating checkpoint with timestamp: $timestamp"
git commit -m "Checkpoint: $timestamp" --allow-empty