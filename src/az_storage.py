import json
from .config import logger, BRONZE_CONTAINER_NAME, ACCOUNT_URL
from azure.identity import AzureCliCredential
from azure.storage.blob import BlobServiceClient


credential = AzureCliCredential()

blob_service_client = BlobServiceClient(ACCOUNT_URL, credential=credential)

container_client = blob_service_client.get_container_client(BRONZE_CONTAINER_NAME)



def check_container_client():
    """
    Get the Azure Bronze container.

    Uses the existing container if available, otherwise creates it.

    Returns:
        ContainerClient: Client connected to the Bronze container.
    """

    if not container_client.exists():

        container_client.create_container()

        logger.info(f"Created Container: {BRONZE_CONTAINER_NAME}")

    else:

        logger.info(f"Using existing container: {BRONZE_CONTAINER_NAME}")



def blob_exists(policeforce, year, month):
    """
    Check if crime data for a year and month already exists in Bronze.

    Args:
        year (str): Crime data year, e.g. "2025".
        month (str): Crime data month, e.g. "02".

    Returns:
        bool: True if the blob exists, otherwise False.
    """
    
    upload_completion = (f"police-force/{policeforce}/{year}/{month}/_MARK_SUCCESS")
    
    blob_client = container_client.get_blob_client(upload_completion)
    
    if blob_client.exists():

        logger.warning(f"Crime data already exists for {policeforce}-{year}-{month}. Avoiding data redundancy.")
    
        return True

    else:

        logger.info(f"Crime data for {year}-{month} does not exist")

        return False

    


def upload_blob_data(policeforce, neighbourhood_id, data, year, month):
    """
    Upload crime data as JSON to the Bronze layer.

    Args:
        policeforce (str): Name of police force
        data (list): Crime records to upload.
        year (str): Crime data year, e.g. "2025".
        month (str): Crime data month, e.g. "02".

    Returns:
        None
    """

    blob_name = f"police-force/{policeforce}/{year}/{month}/{neighbourhood_id}.json"

    blob_client = container_client.get_blob_client(blob_name)

    if blob_client.exists():
        logger.info(f"{blob_name} already exists. Skipping.")
        return

    json_data = json.dumps(data)

    blob_client.upload_blob(json_data, overwrite=False)

    logger.info(f"Uploaded crime data for {policeforce}-{year}-{month} to Bronze Layer.")



def on_injection_completion(policeforce, year, month):

    success_blob = (f"police-force/{policeforce}/{year}/{month}/_MARK_SUCCESS")

    blob_client = container_client.get_blob_client(success_blob)

    blob_client.upload_blob("", overwrite=False)

    logger.info(f"Ingestion marked complete for {policeforce} {year}-{month}")


