import logging
import os

import boto3
import psycopg2
from aws_lambda_powertools.utilities import parameters
from aws_lambda_powertools.utilities.data_classes import S3Event, event_source
from aws_lambda_powertools.utilities.typing import LambdaContext
from txc_processor import download_from_s3_and_write_to_db

s3_client = boto3.client("s3")
cloudwatch_client = boto3.client("cloudwatch")

logger = logging.getLogger()
logger.setLevel(logging.INFO)


@event_source(data_class=S3Event)
def main(event: S3Event, context: LambdaContext):
    bucket = event.bucket_name
    key = event.object_key
    file_path = "/tmp/" + key.split("/")[-1]

    db_name_param = os.environ["DATABASE_NAME_PARAM"]
    db_host_param = os.environ["DATABASE_HOST_PARAM"]
    db_username_param = os.environ["DATABASE_USERNAME_PARAM"]
    db_port_param = os.environ["DATABASE_PORT_PARAM"]
    db_password_param = os.environ["DATABASE_PASSWORD_PARAM"]

    is_local = os.getenv("IS_LOCAL") == "true"

    db_params = parameters.get_parameters_by_name(
        parameters={
            db_name_param: {},
            db_host_param: {},
            db_username_param: {},
            db_port_param: {},
            db_password_param: {},
        },
        max_age=3600,
        decrypt=True,
    )

    with psycopg2.connect(
        f'host={"localhost" if is_local else db_params[db_host_param]} dbname={db_params[db_name_param]} user={db_params[db_username_param]} password={db_params[db_password_param]} port={"35432" if is_local else db_params[db_port_param]}'
    ) as db_connection:
        try:
            download_from_s3_and_write_to_db(
                s3_client,
                cloudwatch_client,
                bucket,
                key,
                file_path,
                db_connection,
                logger,
            )
        except Exception as e:
            logger.error(
                f"ERROR! Failed to write contents of 's3://{bucket}/{key}' to database, error: {e}"
            )
            raise e
        finally:
            if os.path.exists(file_path):
                logger.info(f"Removing File: {file_path}")
                os.remove(file_path)
            else:
                logger.warn(f"File does not exist: {file_path}")
