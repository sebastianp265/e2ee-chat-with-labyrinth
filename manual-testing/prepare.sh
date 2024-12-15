#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
docker_db="e2ee-chat-with-labirynth-server_db-1"
docker_temp_message_storage="e2ee-chat-with-labirynth-temporary_message_storage-1"
cat "${SCRIPT_DIR}/../client/cypress/database/clean.sql" | docker exec -i "$docker_db" psql -U postgres -d server
cat "${SCRIPT_DIR}/data.sql" | docker exec -i "$docker_db" psql -U postgres -d server
docker exec -i "${docker_temp_message_storage}" redis-cli FLUSHDB