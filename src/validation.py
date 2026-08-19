import json
from config import logger, ACCOUNT_URL, QUARANTINE_CONTAINER_NAME
from az_storage import blob_exists, get_container_client
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient



def get_quarantine_container_client():

    default_credential = DefaultAzureCredential()

    blob_service_client = BlobServiceClient(ACCOUNT_URL, credential=default_credential)

    container_client = blob_service_client.get_container_client(QUARANTINE_CONTAINER_NAME)

    if not container_client.exists():
        container_client.create_container()

    return container_client




def validate_container_list(policeforce, year, month):

    if not blob_exists(policeforce, year, month):
        logger.error(f"Extraction on {policeforce}-{year}-{month} not complete")

        return None

    invalid_schema = []

    invalid_data = []

    total_records = 0

    valid_records = 0
    
    container_client = get_container_client()

    blobs_list = container_client.list_blobs(name_starts_with=f"police-force/{policeforce}/{year}/{month}/")

    for blob in blobs_list:

        if not blob.name.endswith(".json"):
            continue

        blob_client = container_client.get_blob_client(blob.name)

        blob_content = blob_client.download_blob().readall()

        records = json.loads(blob_content)

        for record in records:

            total_records += 1

            if not validate_schema(record):

                invalid_schema.append({"source_blob": blob.name, "error_type": "invalid_schema", "record": record})

                continue

            if not validate_data(record):
                
                invalid_data.append({"source_blob": blob.name, "error_type": "invalid_data", "record": record})

                continue
        
            valid_records += 1

    if invalid_schema:
        upload_quarantine(invalid_schema, policeforce, year, month, "invalid-schema")

    if invalid_data:
        upload_quarantine(invalid_data, policeforce, year, month, "invalid-data")

    logger.info(f"Validation complete.")



def validate_schema(record):

    schema = ["category", "location_type", "location", "context", "outcome_status", "persistent_id", "id", "month"]

    for field in schema:

        if field not in record:

            return False

    return True


def validate_data(record):

    required_data = ["category", "location_type", "id", "month"]

    for field in required_data:

        if record[field] is None or record[field] == "":

            return False
        
    return True

def upload_quarantine(data, policeforce, year, month, error_type):

    container_client = get_quarantine_container_client()

    blob_name = (f"police-force/{policeforce}/{year}/{month}/{error_type}.json")

    blob_client = container_client.get_blob_client(blob_name)

    blob_client.upload_blob(json.dumps(data), overwrite=True)
    
