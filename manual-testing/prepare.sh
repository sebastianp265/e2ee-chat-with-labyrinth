#!/bin/bash

SCRIPT_DIR=$(dirname "$0")
docker_container_name=$1
cat "${SCRIPT_DIR}/../client/cypress/database/clean.sql" | docker exec -i "$docker_container_name" psql -U postgres -d server
cat "${SCRIPT_DIR}/data.sql" | docker exec -i "$docker_container_name" psql -U postgres -d server