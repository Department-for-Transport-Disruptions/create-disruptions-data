import boto3
import os
import uuid
import logging
from urllib.parse import unquote_plus
from urllib.error import URLError
import xmlschema

logger = logging.getLogger()
logger.setLevel(logging.INFO)


xsd_path = (
    os.path.dirname(os.path.realpath(__file__))
    + "/xsd/www.siri.org.uk/schema/2.0/xsd/siri.xsd"
)


def get_s3_client():
    s3_client = boto3.client("s3")
    return s3_client


s3_client = get_s3_client()


def read_xsd(schema_path):
    try:
        # Obtain the Schema object from root XSD file to validate the XML
        siri_schema = xmlschema.XMLSchema(schema_path)

    except URLError as file_errors:
        logger.error("XSD file not found exception.")
        logger.error(file_errors)
        raise

    except xmlschema.XMLSchemaValidationError as validation_errors:
        logger.error("Error while reading and validating the schema.")
        logger.error(validation_errors.message)
        logger.error(validation_errors.reason)
        raise

    except xmlschema.XMLSchemaException:
        logger.error("Exception when processing the xsd schema")
        raise

    return siri_schema


def validate_xml(download_path, schema_path):
    try:
        siri_schema = read_xsd(schema_path)
        if siri_schema is None:
            raise ValueError
        else:
            # Validate the XML data against the XSD
            siri_schema.validate(download_path)

    except xmlschema.XMLSchemaChildrenValidationError as sub_element_errors:
        logger.error("Error in Sub elements of the XML.")
        logger.error(sub_element_errors.message)
        logger.error(sub_element_errors.reason)
        raise

    except xmlschema.XMLSchemaValidationError as validation_errors:
        logger.error("Error validating the XML with the Schema.")
        logger.error(validation_errors.message)
        logger.error(validation_errors.reason)
        raise

    except ValueError:
        logger.error("No data returned when reading the XSD schema")
        raise

    except xmlschema.XMLSchemaException:
        logger.error("Exception when validating the XML data.")
        raise

    except Exception:
        logger.error("Unknown error, exiting.")
        raise


def main(event, context):
    for record in event["Records"]:
        source_bucket = record["s3"]["bucket"]["name"]
        key = unquote_plus(record["s3"]["object"]["key"])
        tmpkey = key.replace("/", "")
        download_path = "/tmp/{}{}".format(uuid.uuid4(), tmpkey)
        s3_client.download_file(source_bucket, key, download_path)

        try:
            logger.info("Starting  validation...")
            validate_xml(download_path, xsd_path)

            logger.info("Siri SX XML is valid, uploading to S3...")
            s3_client.upload_file(
                download_path,
                os.getenv("SIRI_SX_BUCKET_NAME"),
                "SIRI-SX.xml",
            )

        except Exception as e:
            logger.error(
                f"There was an error when validating Siri SX file: \
                    {key}, error: {e}"
            )
