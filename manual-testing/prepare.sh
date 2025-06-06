#!/bin/bash

DEFAULT_DOCKER_DB="server_db"
DEFAULT_DOCKER_TEMP_MESSAGE_STORAGE="server_temp_db"

docker_db=${1:-$DEFAULT_DOCKER_DB}
docker_temp_message_storage=${2:-$DEFAULT_DOCKER_TEMP_MESSAGE_STORAGE}

SCRIPT_DIR=$(dirname "$0")

cat "${SCRIPT_DIR}/../client/cypress/database/clean.sql" | docker exec -i "$docker_db" psql -U postgres -d server_db
cat "${SCRIPT_DIR}/data.sql" | docker exec -i "$docker_db" psql -U postgres --d server_db

docker exec -i "$docker_temp_message_storage" redis-cli -a redis_password FLUSHDB