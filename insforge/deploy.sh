#!/usr/bin/env bash
# Empaqueta y despliega las edge functions de BecaBot.
set -euo pipefail
cd "$(dirname "$0")/.."

node insforge/build.mjs

npx -y @insforge/cli functions deploy ingest-beca \
  --file insforge/dist/ingest-beca.js \
  --name "Ingest Beca" \
  --description "Ingesta una beca, genera embeddings de descripcion/requisitos/chunks (solo service role)"

npx -y @insforge/cli functions deploy ask \
  --file insforge/dist/ask.js \
  --name "Ask" \
  --description "Responde preguntas sobre becas con RAG y persiste la conversacion"

npx -y @insforge/cli functions deploy guardar-conocimiento \
  --file insforge/dist/guardar-conocimiento.js \
  --name "Guardar Conocimiento" \
  --description "Juzga la utilidad de una respuesta web, la resume y la guarda en el RAG (solo service role)"

npx -y @insforge/cli functions deploy enviar-recordatorios \
  --file insforge/dist/enviar-recordatorios.js \
  --name "Enviar Recordatorios" \
  --description "Genera y envia recordatorios de becas por email (solo service role)"
