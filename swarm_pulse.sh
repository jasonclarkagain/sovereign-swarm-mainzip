#!/bin/bash
NODES="/home/unknown/swarm_nodes.txt"

echo -e "\e[1;34m--- SWARM HEARTBEAT MONITOR ---\e[0m"
printf "%-15s %-10s %-10s %-15s\n" "NODE_IP" "RAM_USE" "TOR_9051" "LAST_LOG"
echo "------------------------------------------------------------"

if [ ! -f "$NODES" ]; then
    echo "Error: swarm_nodes.txt not found at $NODES"
    exit 1
fi

while read -r ip; do
    # Check RAM, Tor Port, and the last line of the Overlord log
    STATS=$(ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no unknown@$ip \
    "free -m | awk '/Mem:/ {print \$3\"MB/\"\$2\"MB\"}'; \
    ss -nlt | grep -q 9051 && echo 'ALIVE' || echo 'DEAD'; \
    tail -n 1 /var/log/sovereign.log 2>/dev/null | cut -c1-20" 2>/dev/null)
    
    if [ -z "$STATS" ]; then
        printf "\e[1;31m%-15s %-35s\e[0m\n" "$ip" "OFFLINE"
    else
        RAM=$(echo "$STATS" | sed -n '1p')
        TOR=$(echo "$STATS" | sed -n '2p')
        LOG=$(echo "$STATS" | sed -n '3p')
        printf "%-15s %-10s %-10s %-15s\n" "$ip" "$RAM" "$TOR" "$LOG"
    fi
done < "$NODES"
