param(
    [switch]$Dev
)

$Container = if ($Dev) { "cv-parser-ollama-dev" } else { "cv-parser-ollama" }

Write-Host "Ollama model indiriliyor: gemma3:12b (container: $Container)" -ForegroundColor Cyan
docker exec $Container ollama pull gemma3:12b
Write-Host "Model hazır!" -ForegroundColor Green
