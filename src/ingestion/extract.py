import requests
import time
from .config import logger, URL_POLICE_FORCE, URL_NEIGHBOURHOODS, URL_NEIGHBOURHOOD_BOUNDARY, URL_STREET_LEVEL_CRIME, URL_CRIME_STREET_DATE


# =============================================================================
# PIPELINE CONFIGURATION
# =============================================================================

REQUEST_TIMEOUT = 30
RETRY_ATTEMPTS = 5
BATCH_SIZE = 15
RETRY_DELAY = 2


# =============================================================================
# CHECK AVAILABLE MONTH
# =============================================================================
def check_month_available(year, month):

    try:
        response = requests.get(URL_CRIME_STREET_DATE, timeout=REQUEST_TIMEOUT)

        response.raise_for_status()

    except requests.RequestException:

        logger.exception("Failed to retrieve available crime dates")

        return False

    available_dates = response.json()

    target_date = f"{year}-{month}"

    for item in available_dates:

        if item["date"] == target_date:

            logger.info(f"Crime data available for {target_date}")

            return True

    logger.warning(f"Crime data not available for {target_date}")

    return False





# =============================================================================
# POLICE FORCE
# =============================================================================
def get_police_force(force_name):

    """
    Retrieve the police force ID for the specified police force name.

    Sends a request to the Police API to retrieve the available police
    forces and searches the response for a force matching the provided
    name.

    Args:
        force_name (str): The name of the police force to search for.

    Returns:
        str | None: The police force ID if a matching force is found;
        otherwise, None if the request fails or no matching force exists.
    """

    try:

        request_police_force = requests.get(URL_POLICE_FORCE, timeout=REQUEST_TIMEOUT)

        request_police_force.raise_for_status()

    except requests.RequestException:

        logger.exception("Failed to retrieve police forces.")

        return None

    police_force = request_police_force.json()

    for force in police_force:

        if force["name"] == force_name:

            logger.info(f"Retreived {force['name']} ID")

            return force["id"]

    logger.warning(
        f"Police force not found: {force_name}"
    )

    return None



# =============================================================================
# NEIGHBOURHOODS
# =============================================================================
def get_neighborhoods(force_id):

    """
    Retrieve neighbourhood IDs for the specified police force.

    Sends a request to the Police API to retrieve all neighbourhoods
    associated with the provided police force ID and returns a list
    containing each neighbourhood ID.

    Args:
        force_id (str): The unique identifier of the police force.

    Returns:
        list[str] | None: A list of neighbourhood IDs if the request
        succeeds; otherwise, None if the request fails.
    """

    try:
        
        request_police_neighborhood = requests.get(URL_NEIGHBOURHOODS.format(force_id=force_id), timeout=REQUEST_TIMEOUT)

        request_police_neighborhood.raise_for_status()

    except requests.RequestException:

        logger.exception(f"Failed to retrieve neighbourhoods for force: {force_id}")
        
        return None 

    neighborhood_ids = []

    for neighbourhood in request_police_neighborhood.json():


        neighborhood_ids.append(neighbourhood['id'])

    logger.info(f"Successfully extracted "f"{len(neighborhood_ids)} neighbourhood IDs"
    )
    return neighborhood_ids



# =============================================================================
# NEIGHBOURHOOD BOUNDARIES
# =============================================================================
def get_neighbourhood_boundaries(force_id, neighbourhood_ids):

    """
    Retrieve boundary data for the specified neighbourhoods.

    Sends requests to the Police API for each neighbourhood ID and
    retrieves the geographical boundary associated with that
    neighbourhood.

    Requests are processed in batches and retried when the API returns
    a rate-limit response.

    Args:
        force_id (str): The unique identifier of the police force.
        neighbourhood_ids (list[str]): Neighbourhood IDs whose boundary
            data should be retrieved.

    Returns:
        list[dict]: A list containing each neighbourhood ID and its
        corresponding geographical boundary.
    """


    boundary_data = []

    for index in range(0, len(neighbourhood_ids), BATCH_SIZE):


        neigbourhood_batch = neighbourhood_ids[index:index + BATCH_SIZE]

        for neighbourhood_id in neigbourhood_batch:


            for attempt in range(1, RETRY_ATTEMPTS + 1):

                try:
                     
                    police_neigbourhood_boundary = requests.get(URL_NEIGHBOURHOOD_BOUNDARY.format(force_id=force_id, neighbourhood_id=neighbourhood_id), timeout=REQUEST_TIMEOUT)

                except requests.RequestException:

                    logger.exception(f"Failed to retrieve boundary for {neighbourhood_id}. "f"Attempt {attempt}/{RETRY_ATTEMPTS}")

                    if attempt < RETRY_ATTEMPTS:

                        time.sleep(RETRY_DELAY)

                    continue


                if police_neigbourhood_boundary.status_code == 200:

                    boundary_data.append(
                        {
                            "neighbourhood_id": neighbourhood_id, "boundary": police_neigbourhood_boundary.json()
                        }
                    )

                    logger.info(f"Boundary retrieved successfully for {neighbourhood_id}")

                    break  

                elif police_neigbourhood_boundary.status_code == 429:
                        
                    if attempt < RETRY_ATTEMPTS:

                        time.sleep(RETRY_DELAY)

                    continue

                break

            else:
                logger.error(
                    f"Failed to retrieve boundary for "
                    f"{neighbourhood_id} after "
                    f"{RETRY_ATTEMPTS} attempts"
                )

    
    logger.info(f"Boundary extraction complete. "
                   f"Retrieved {len(boundary_data)} of "
                   f"{len(neighbourhood_ids)} boundaries"
    )

    return boundary_data                  




# =============================================================================
# POLYGON CREATION
# =============================================================================

def create_polygon(boundary):

    """
    Convert neighbourhood boundary coordinates into a polygon string.

    Converts each latitude and longitude coordinate into the format
    required by the Police API and joins the coordinates using colon
    separators.

    Args:
        boundary (list[dict]): Boundary coordinates containing latitude
        and longitude values.

    Returns:
        str: A polygon string containing the formatted coordinates.
    """

    polygon_points = []

    for point in boundary:

        latitude = point["latitude"]
        longitude = point["longitude"]

        polygon_points.append(f"{latitude},{longitude}")

    polygon = ":".join(polygon_points)

    return polygon




# =============================================================================
# CRIME DATA
# =============================================================================

def get_crime_data(year, month, polygon):

    """
    Retrieve street-level crime data for the specified polygon and date.

    Sends the polygon coordinates and requested year and month to the
    Police API. Temporary rate-limit and server errors are retried before
    the request is considered unsuccessful.

    Args:
        year (str): The year for which crime data should be retrieved.
        month (str): The month for which crime data should be retrieved.
        polygon (str): Polygon containing the geographical coordinates
            of the neighbourhood.

    Returns:
        list[dict] | None: Crime records returned by the API if the
        request succeeds; otherwise, None.
    """

    crime_data = []

    post_data = {"date": f"{year}-{month}", "poly": polygon}
    

    for attempt in range(1, RETRY_ATTEMPTS + 1):

        try:

            request_crime_data = requests.post(URL_STREET_LEVEL_CRIME, data=post_data, timeout=REQUEST_TIMEOUT)

        except requests.RequestException:

            logger.exception(f"Failed to retrieve crime data. {attempt} /{RETRY_ATTEMPTS}")

            if attempt < RETRY_ATTEMPTS:

                time.sleep(RETRY_DELAY)

            continue

        if request_crime_data.status_code == 200:

            crime_data = request_crime_data.json()

            logger.info(f"Successfully retrieved "
                           f"{len(crime_data)} crime records")

            return crime_data


        if request_crime_data.status_code == 400:

            logger.error(f"400 Bad Request - Polygon may be invalid or request URL too large")

            return None


        if request_crime_data.status_code == 414:

            logger.error("414 Request URI Too Large - Polygon contains too many coordinates")

            return None

        
        if request_crime_data.status_code == 429:

            try:

                retry_after = request_crime_data.json().get(
                    "retry_after",
                    30
                )

                retry_after = int(retry_after)

            except (ValueError, TypeError, AttributeError):

                retry_after = 30

            logger.warning(
                f"429 Too Many Requests - "
                f"waiting {retry_after}s - "
                f"attempt {attempt}/{RETRY_ATTEMPTS}"
            )

            if attempt < RETRY_ATTEMPTS:

                time.sleep(retry_after)

            continue
            
        if 500 <= request_crime_data.status_code < 600:

            logger.warning(
                f"Server error {request_crime_data.status_code} - "
                f"attempt {attempt}/{RETRY_ATTEMPTS}"
            )


            if attempt < RETRY_ATTEMPTS:

                time.sleep(5)

            continue

        logger.error(f"Unexpected status code {request_crime_data.status_code}")

        return None

    logger.error(f"Failed to retrieve crime data after {RETRY_ATTEMPTS} attempts")

    return None


