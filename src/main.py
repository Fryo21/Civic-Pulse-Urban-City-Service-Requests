from .extract import check_month_available, get_police_force, get_neighborhoods, create_polygon, get_neighbourhood_boundaries, get_crime_data
from .az_storage import  blob_exists, upload_blob_data, on_injection_completion, check_container_client
from .config import logger


def run_ingestion(search_force, year, month):
    """
    Run the monthly crime data ingestion pipeline.

    Checks data availability and prevents duplicate ingestion before
    extracting crime data and uploading it to the Bronze layer.

    Inputs:
        YEAR (str): Year of crime data to ingest.
        MONTH (str): Month of crime data to ingest.
        SEARCH_FORCE (str): Police force to retrieve data for.

    Returns:
        list: Extracted crime records after successful ingestion.
        None: If data is unavailable, already exists, or ingestion fails.
    """

    check_container_client()
    
    police_force = get_police_force(search_force)

    if police_force is None:

        logger.error("Police force could not be retrieved.")

        return
    

    if not check_month_available(year, month):

        logger.warning(f"No crime data available for {year}-{month}")

        return

    if blob_exists(police_force, year, month):

        logger.warning(f"Crime data for {year}-{month} already exists in Bronze.")

        return



    logger.info("Starting ingestion...")

    total_records = 0

    neighbourhood_ids = get_neighborhoods(police_force)

    if not neighbourhood_ids:

        logger.error("No neighbourhoods retrieved.")

        return

    boundaries = get_neighbourhood_boundaries(police_force, neighbourhood_ids)

    if not boundaries:

        logger.error("No neighbourhood boundaries retrieved.")

        return


    for neighbourhood in boundaries:

        neighbourhood_id = neighbourhood["neighbourhood_id"]

        polygon = create_polygon(neighbourhood["boundary"])

        crime_data = get_crime_data(year, month, polygon)

        if not crime_data:

            logger.info(f"No crime data on the {year}-{month} for neighbourhood: {neighbourhood_id}")
            continue

        total_records += len(crime_data)
        upload_blob_data(police_force, neighbourhood_id, crime_data, year=year, month=month)


    on_injection_completion(police_force, year, month)

    return {
            "status": "success", 
            "force": police_force,
            "year": year, 
            "month": month, 
            "records_ingested": total_records
            }



