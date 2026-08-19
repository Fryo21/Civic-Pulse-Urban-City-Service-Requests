import logging
import os 
from dotenv import load_dotenv


load_dotenv()

# storage
STORAGE_ACCOUNT_NAME = os.getenv("STORAGE_ACCOUNT_NAME")
BRONZE_CONTAINER_NAME = os.getenv("BRONZE_CONTAINER_NAME")
QUARANTINE_CONTAINER_NAME = os.getenv("QUARANTINE_CONTAINER_NAME")

ACCOUNT_URL = f"https://{STORAGE_ACCOUNT_NAME}.blob.core.windows.net"

# Police API
URL_POLICE_FORCE = os.getenv("URL_POLICE_FORCE")
URL_NEIGHBOURHOODS = os.getenv("URL_NEIGHBOURHOODS")
URL_NEIGHBOURHOOD_BOUNDARY = os.getenv("URL_NEIGHBOURHOOD_BOUNDARY")
URL_STREET_LEVEL_CRIME = os.getenv("URL_STREET_LEVEL_CRIME")
URL_CRIME_STREET_DATE = os.getenv("URL_CRIME_STREET_DATE")

# Pipeline parameters
YEAR = os.getenv("YEAR")
MONTH = os.getenv("MONTH")
SEARCH_FORCE = os.getenv("SEARCH_FORCE")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")

# Configure Logging
logging.basicConfig(
    filename = "test.log",
    filemode = "w",
    format = "%(asctime)s - %(levelname)s - %(message)s",
    level = logging.DEBUG,
)


logging.getLogger("urllib3").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

