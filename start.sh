#!/bin/bash
# Script pour démarrer l'API Fisher Fans

echo "🎣 Démarrage de l'API Fisher Fans..."

# Tuer le processus sur le port 8443 si existant
echo "🔍 Vérification du port 8443..."
PORT_PID=$(lsof -ti:8443 2>/dev/null || netstat -ano | findstr :8443 | awk '{print $5}' | head -1)

if [ ! -z "$PORT_PID" ]; then
  echo "⚠️  Port 8443 déjà utilisé par le processus $PORT_PID"
  echo "🔫 Arrêt du processus..."
  kill -9 $PORT_PID 2>/dev/null || taskkill //PID $PORT_PID //F 2>/dev/null
  sleep 2
fi

echo "🚀 Lancement de l'application..."
npm run start:dev
