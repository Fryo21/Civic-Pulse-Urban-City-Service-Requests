resource_group_name = "rg-london-crime-data"
location            = "norwayeast"

storage_primary_name    = "stlondoncrime"
storage_additional_name = "rglondoncrimedata8f05"

data_factory_name = "adf-london-crime"

postgres_server_name         = "goldlondon"
postgres_administrator_login = "LondonCrime"
postgressql_admin_password   = "ChangeMe123!"
postgres_sku_name            = "B_Standard_B2s"
postgres_storage_mb          = 32768

function_app_name              = "fa-crime-extraction"
function_app_service_plan_name = "ASP-rglondoncrimedata-8b80"

monitor_email_address = "K2444288@kingston.ac.uk"
