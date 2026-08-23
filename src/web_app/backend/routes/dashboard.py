import calendar

from fastapi import APIRouter

from database import get_connection

router = APIRouter(prefix="/api/crime", tags=["crime"])


@router.get("/dashboard")
def get_dashboard(year: int, month: int):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM stg_crime
                WHERE year = %s AND month = %s;
                """,
                [year, month],
            )
            (total_crimes,) = cursor.fetchone()

            cursor.execute(
                """
                SELECT category, COUNT(*) AS count
                FROM stg_crime
                WHERE year = %s AND month = %s AND category IS NOT NULL
                GROUP BY category
                ORDER BY count DESC;
                """,
                [year, month],
            )
            categories = [
                {"category": row[0], "count": row[1]} for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT street_name, latitude, longitude, COUNT(*) AS count
                FROM stg_crime
                WHERE year = %s AND month = %s
                  AND latitude IS NOT NULL
                  AND longitude IS NOT NULL
                GROUP BY street_name, latitude, longitude
                ORDER BY count DESC
                LIMIT 10;
                """,
                [year, month],
            )
            locations = [
                {
                    "street": row[0],
                    "latitude": row[1],
                    "longitude": row[2],
                    "count": row[3],
                }
                for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT COUNT(DISTINCT street_name)
                FROM stg_crime
                WHERE year = %s AND month = %s AND street_name IS NOT NULL;
                """,
                [year, month],
            )
            (unique_streets,) = cursor.fetchone()

            cursor.execute(
                """
                SELECT month, category, COUNT(*) AS count
                FROM stg_crime
                WHERE year = %s AND category IS NOT NULL
                GROUP BY month, category
                ORDER BY month;
                """,
                [year],
            )
            trend_rows = cursor.fetchall()

    monthly_trend: dict[int, dict] = {}

    for trend_month, category, count in trend_rows:
        row = monthly_trend.setdefault(
            trend_month,
            {
                "month": trend_month,
                "label": calendar.month_abbr[trend_month],
            },
        )
        row[category] = count

    return {
        "summary": {
            "totalCrimes": total_crimes,
            "topCategory": categories[0]["category"] if categories else None,
            "topLocation": locations[0]["street"] if locations else None,
            "uniqueStreets": unique_streets,
        },
        "categories": categories,
        "locations": locations,
        "monthlyTrend": [
            monthly_trend[key] for key in sorted(monthly_trend.keys())
        ],
    }
