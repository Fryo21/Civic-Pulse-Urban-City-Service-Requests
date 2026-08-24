terraform {

  required_providers {

    azurerm = {

      source  = "hashicorp/azurerm"
      version = "~> 4.0"

    }

  }

  backend "azurerm" {

    resource_group_name  = "rg-london-crime-data"
    storage_account_name = "teraformstate1212"
    container_name       = "tfstate"
    key                  = "london-crime.tfstate"
    use_azuread_auth     = true

  }

}

provider "azurerm" {

  features {}

  storage_use_azuread = true

}

module "resource_group" {

  source = "./modules/resource-group"

  name     = var.resource_group_name
  location = var.location

}

module "storage" {

  source = "./modules/storage"

  resource_group_name = module.resource_group.name
  location            = var.location
  primary_name        = var.storage_primary_name
  additional_name     = var.storage_additional_name

}

module "data_factory" {

  source = "./modules/data-factory"

  resource_group_name = module.resource_group.name
  location            = var.location
  name                = var.data_factory_name

}

module "postgres" {

  source = "./modules/postgres"

  resource_group_name    = module.resource_group.name
  location               = var.location
  name                   = var.postgres_server_name
  administrator_login    = var.postgres_administrator_login
  administrator_password = var.postgressql_admin_password
  sku_name               = var.postgres_sku_name
  storage_mb             = var.postgres_storage_mb

}

module "function_app" {

  source = "./modules/function-app"

  resource_group_name           = module.resource_group.name
  location                      = var.location
  name                          = var.function_app_name
  service_plan_name             = var.function_app_service_plan_name
  deployment_container_endpoint = module.storage.deployment_container_endpoint

  host_storage_account_id = module.storage.additional_id
  data_storage_account_id = module.storage.primary_id

  app_settings = {

    "AzureWebJobsStorage"              = ""
    "AzureWebJobsStorage__accountName" = module.storage.additional_name
    "FUNCTIONS_EXTENSION_VERSION"      = "~4"

    "BRONZE_CONTAINER_NAME"      = "bronze-london"
    "QUARANTINE_CONTAINER_NAME"  = "quarantine-london"
    "STORAGE_ACCOUNT_NAME"       = var.storage_primary_name
    "URL_CRIME_STREET_DATE"      = "https://data.police.uk/api/crimes-street-dates"
    "URL_NEIGHBOURHOODS"         = "https://data.police.uk/api/{force_id}/neighbourhoods"
    "URL_NEIGHBOURHOOD_BOUNDARY" = "https://data.police.uk/api/{force_id}/{neighbourhood_id}/boundary"
    "URL_POLICE_FORCE"           = "https://data.police.uk/api/forces"
    "URL_STREET_LEVEL_CRIME"     = "https://data.police.uk/api/crimes-street/all-crime"

  }

}

module "monitoring" {

  source = "./modules/monitoring"

  resource_group_name = module.resource_group.name
  data_factory_id     = module.data_factory.id
  email_address       = var.monitor_email_address

}