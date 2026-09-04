from fastapi import APIRouter

from database import get_connection

router = APIRouter(prefix="/api/crime", tags=["crime"])


@router.get("/hotspots")
def get_hotspots(
    year: int,
    month: int,
    category: str = "all",
):
    query = """
        SELECT
            street_name,
            latitude,
            longitude,
            COUNT(*) AS count
        FROM stg_crime
        WHERE year = %s
          AND month = %s
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
    """

    params = [year, month]

    if category != "all":
        query += " AND category = %s"
        params.append(category)

    query += """
        GROUP BY street_name, latitude, longitude
        ORDER BY count DESC;
    """

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params)

            rows = cursor.fetchall()

    return [
        {
            "street": row[0],
            "latitude": row[1],
            "longitude": row[2],
            "count": row[3],
        }
        for row in rows
    ]