#!/bin/bash

docker_container_name=$1
tables=(
  labyrinth
  epoch
  virtual_device
  virtual_device_encrypted_recovery_secrets
  virtual_device_epoch_membership_proof
  device
  device_epoch_membership_proof
)

tables_args=""
for table in "${tables[@]}"; do
  tables_args="$tables_args -t $table"
done

docker exec -i "$docker_container_name" bash -c "pg_dump -U postgres -d server --data-only --inserts $tables_args" > data.sql
