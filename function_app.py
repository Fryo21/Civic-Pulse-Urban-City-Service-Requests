import json
import azure.functions as func
import azure.durable_functions as df
from src.main import run_ingestion


app = df.DFApp(http_auth_level=func.AuthLevel.FUNCTION)


@app.route(route="ingest-crime", methods=["POST"])

@app.durable_client_input(client_name="client")



async def ingest_crime(req: func.HttpRequest, client: df.DurableOrchestrationClient) -> func.HttpResponse:

    try:

        body = req.get_json()

        force = body.get("force_name")

        year = body.get("year")

        month = body.get("month")

        if not force or not year or not month:

            return func.HttpResponse("force, year and month are required.", status_code=400)

        input_data = {"force_name": force,
                       "year": year, 
                       "month": month}

        instance_id = await client.start_new("crime_ingestion_orchestrator", client_input=input_data)

        return client.create_check_status_response(req, instance_id)
    

    except Exception as error:

        return func.HttpResponse(
            str(error),
            status_code=500
        )


@app.orchestration_trigger(context_name="context")

def crime_ingestion_orchestrator(context: df.DurableOrchestrationContext):

    input_data = context.get_input()

    result = yield context.call_activity("crime_ingestion_activity", input_data)

    return result


@app.activity_trigger(input_name="input_data")

def crime_ingestion_activity(input_data: dict):

    force_name = input_data["force_name"]

    year = input_data["year"]

    month = input_data["month"]

    return run_ingestion(force_name, year, month)