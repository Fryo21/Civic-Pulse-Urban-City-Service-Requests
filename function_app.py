import json
import azure.functions as func

from src.main import run_ingestion


app = func.FunctionApp()


@app.route(
    route="ingest-crime",
    methods=["POST"],
    auth_level=func.AuthLevel.FUNCTION
)
def ingest_crime(req: func.HttpRequest) -> func.HttpResponse:

    try:
        body = req.get_json()

        force = body.get("force")
        year = body.get("year")
        month = body.get("month")

        if not force or not year or not month:
            return func.HttpResponse(
                "force, year and month are required.",
                status_code=400
            )

        result = run_ingestion(
            force,
            year,
            month
        )

        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json",
            status_code=200
        )

    except Exception as error:

        return func.HttpResponse(
            str(error),
            status_code=500
        )