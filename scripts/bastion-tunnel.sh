#!/bin/bash

set -e
set -u
set -o pipefail

INSTANCE=$(aws ec2 describe-instances --region=eu-west-2 --filters Name=tag:Bastion,Values=true Name=instance-state-name,Values=running | jq -r '.Reservations[0].Instances[0]')
INSTANCE_ID=`echo ${INSTANCE} | jq -r '.InstanceId'`
AZ=`echo ${INSTANCE} | jq -r '.Placement.AvailabilityZone'`
LOCAL_PORT=35432
DATABASE_HOSTNAME="db.cdd.internal"
REGION="eu-west-2"

echo "starting ssh database tunnel"
echo "bastion instance: ${INSTANCE_ID}"
echo "database: ${DATABASE_HOSTNAME}"
echo "local port: ${LOCAL_PORT}"
echo "region: ${REGION}"

aws ssm start-session \
    --region $REGION \
    --target $INSTANCE_ID \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters host=$DATABASE_HOSTNAME,portNumber="5432",localPortNumber=$LOCAL_PORT