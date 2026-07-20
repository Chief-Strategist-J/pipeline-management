#!/usr/bin/env bash
set -e

# Go to directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

echo "============================================="
echo " Setting up Local Gateway Live Testing Env   "
echo "============================================="

# 1. Create TLS certs directory and generate self-signed certs
mkdir -p certs
if [ ! -f certs/api.example.com.key ]; then
    echo "[*] Generating self-signed TLS certificates..."
    openssl req -x509 -newkey rsa:2048 -keyout certs/api.example.com.key -out certs/api.example.com.crt -days 365 -nodes -subj "/CN=api.example.com"
fi
chmod 644 certs/api.example.com.key certs/api.example.com.crt
chmod -R 755 runtime-adapters/

# 2. Swap upstreams temporarily to use docker-compose service names
echo "[*] Backing up current production upstreams..."
mkdir -p backup_upstreams
cp -r routing/upstreams/* backup_upstreams/

echo "[*] Configuring upstreams for local docker networks..."
echo -e "targets:\n  - \"user-service:5678\"\nload_balancing: round_robin\nkeepalive:\n  connections: 32\n  timeout: 60s" > routing/upstreams/user-service/pool-config
echo -e "targets:\n  - \"product-service:5678\"\nload_balancing: round_robin\nkeepalive:\n  connections: 32\n  timeout: 60s" > routing/upstreams/product-service/pool-config
echo -e "targets:\n  - \"order-service:5678\"\nload_balancing: round_robin\nkeepalive:\n  connections: 32\n  timeout: 60s" > routing/upstreams/order-service/pool-config

# 3. Compile configurations
echo "[*] Running config compiler..."
python3 runtime-adapters/compiler.py --proxy all

# 4. Start Docker Compose
echo "[*] Launching Gateway and Mock Services..."
docker compose down || true
docker compose up -d

echo "[*] Waiting for services to become healthy..."
sleep 5

echo "============================================="
echo " Live Test Execution (Using curl)            "
echo "============================================="

echo "[TEST 1] Routing via NGINX (Port 8443) to user-service:"
curl -k --resolve api.example.com:8443:127.0.0.1 https://api.example.com:8443/v1/users
echo -e "\n"

echo "[TEST 2] Routing via TRAEFIK (Port 9443) to product-service:"
curl -k --resolve api.example.com:9443:127.0.0.1 https://api.example.com:9443/v1/products
echo -e "\n"

echo "[TEST 3] Routing via TRAEFIK (Port 9443) to order-service:"
curl -k --resolve api.example.com:9443:127.0.0.1 https://api.example.com:9443/v1/orders
echo -e "\n"

# 5. Clean up
echo "============================================="
echo " Cleaning Up Test Environment                "
echo "============================================="
docker compose down

echo "[*] Restoring production upstreams..."
cp -r backup_upstreams/* routing/upstreams/
rm -rf backup_upstreams

echo "[✓] Test complete!"
