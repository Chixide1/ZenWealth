#!/bin/bash
set -e

# Run the original entrypoint
docker-entrypoint.sh "$@" &
BG_PID=$!

# Wait for PostgreSQL to start
sleep 10

# Always run your initialization script
psql -U zenwealth_app -d zenwealth < /docker-entrypoint-initdb.d/01-init.sql

wait $BG_PID