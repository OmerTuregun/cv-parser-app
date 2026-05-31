#!/bin/bash
CONTAINER="${1:-cv-parser-ollama}"
if [ "$1" = "dev" ]; then
  CONTAINER="cv-parser-ollama-dev"
fi
echo "Ollama model indiriliyor: gemma3:12b (container: $CONTAINER)"
docker exec "$CONTAINER" ollama pull gemma3:12b
echo "Model hazır!"
