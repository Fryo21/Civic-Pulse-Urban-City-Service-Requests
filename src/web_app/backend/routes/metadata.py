from collections import defaultdict

from fastapi import APIRouter

from database import get_connection

router = APIRouter(prefix="/api/crime", tags=["crime"])


@router.get("/metadata")
def get_metadata():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT DISTINCT year, month
                FROM stg_crime
                WHERE year IS NOT NULL AND month IS NOT NULL
                ORDER BY year, month;
                """
            )
            periods = cursor.fetchall()

            cursor.execute(
                """
                SELECT DISTINCT category
                FROM stg_crime
                WHERE category IS NOT NULL
                ORDER BY category;
                """
            )
            categories = [row[0] for row in cursor.fetchall()]

    months_by_year: dict[int, list[int]] = defaultdict(list)

    for year, month in periods:
        months_by_year[year].append(month)

    years = sorted(months_by_year.keys())

    if not periods:
        latest = None
    else:
        latest_year, latest_month = periods[-1]
        latest = {"year": latest_year, "month": latest_month}

    return {
        "years": years,
        "monthsByYear": months_by_year,
        "categories": categories,
        "latest": latest,
    }
