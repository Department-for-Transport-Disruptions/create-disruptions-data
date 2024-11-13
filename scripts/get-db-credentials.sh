#!/bin/bash

SECRET_ARN=$(aws secretsmanager list-secrets --query "SecretList[?starts_with(Name, 'rds!cluster')].ARN" --output text)

aws secretsmanager get-secret-value --secret-id $SECRET_ARN | jq -r '.SecretString' | jq .