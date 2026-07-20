#!/usr/bin/env bash
# Dynamic Gateway Hot-Reload Agent
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

echo "[*] Compiling latest gateway configurations..."
python3 runtime-adapters/compiler.py --proxy all

echo "[*] Checking configuration syntax..."

# 1. Nginx syntax check
if docker ps --filter "name=nginx-gateway" --quiet | grep -q .; then
    echo "[*] Checking Nginx configuration syntax..."
    docker exec nginx-gateway nginx -t
    echo "[✓] Nginx syntax check passed. Gracefully reloading worker processes..."
    docker exec nginx-gateway nginx -s reload
else
    echo "[!] nginx-gateway container is not running. Skipping reload."
fi

# 2. Apache syntax check
if docker ps --filter "name=apache-gateway" --quiet | grep -q .; then
    echo "[*] Checking Apache configuration syntax..."
    docker exec apache-gateway httpd -t
    echo "[✓] Apache syntax check passed. Gracefully reloading..."
    docker exec apache-gateway apachectl -k graceful
else
    echo "[!] apache-gateway container is not running. Skipping reload."
fi

# 3. Traefik
if docker ps --filter "name=traefik-gateway" --quiet | grep -q .; then
    echo "[✓] Traefik handles file reloads dynamically. Changes applied instantly."
else
    echo "[!] traefik-gateway container is not running."
fi

echo "[✓] Gateway hot-reload sequence completed successfully."
