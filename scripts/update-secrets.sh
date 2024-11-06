#!/bin/bash

stage=${1:-}

if [ -z "$1" ]; then
    echo "Usage: $0 <stage>"
    exit 1
fi

envs=("sandbox" "test" "preprod" "prod")

is_user_env=true
schema=$stage

for item in "${envs[@]}"; do
    if [ "$item" == "$stage" ]; then
        is_user_env=false
        schema="public"
        break
    fi
done

SECRET_ARN=$(aws secretsmanager list-secrets --query "SecretList[?starts_with(Name, 'rds!cluster')].ARN" --output text)

aws secretsmanager cancel-rotate-secret --secret-id $SECRET_ARN > /dev/null

secret=$(aws secretsmanager get-secret-value --secret-id $SECRET_ARN | jq -r '.SecretString')

username=$(echo $secret | jq -r '.username')
password=$(echo $secret | jq -r '.password')

local_connection_string="postgresql://${username}:${password}@localhost:35432/disruptions?schema=${schema}"
connection_string="postgresql://${username}:${password}@db.cdd.internal:5432/disruptions?schema=${schema}"

if [ "$is_user_env" = true ]; then
    pnpm sst secrets set DB_CONNECTION_STRING $local_connection_string --stage $stage

    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo "DATABASE_URL=\"$local_connection_string\"" > "$script_dir/../shared-ts/.env"
fi

pnpm sst secrets set DB_CONNECTION_STRING $connection_string --stage $stage