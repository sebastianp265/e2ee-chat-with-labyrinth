#!/bin/bash

DEFAULT_DOCKER_DB="e2ee-chat-with-labirynth-server_db-1"
DEFAULT_DOCKER_TEMP_MESSAGE_STORAGE="e2ee-chat-with-labirynth-temporary_message_storage-1"

docker_db=${1:-$DEFAULT_DOCKER_DB}
docker_temp_message_storage=${2:-$DEFAULT_DOCKER_TEMP_MESSAGE_STORAGE}

SCRIPT_DIR=$(dirname "$0")

cat "${SCRIPT_DIR}/../client/cypress/database/clean.sql" | docker exec -i "$docker_db" psql -U postgres -d server
cat "${SCRIPT_DIR}/data.sql" | docker exec -i "$docker_db" psql -U postgres -d server

docker exec -i "$docker_temp_message_storage" redis-cli FLUSHDB