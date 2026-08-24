resource "azurerm_service_plan" "this" {

  name                = var.service_plan_name
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "FC1"

}

resource "azurerm_function_app_flex_consumption" "this" {

  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.this.id

  storage_container_type      = "blobContainer"
  storage_container_endpoint  = var.deployment_container_endpoint
  storage_authentication_type = "SystemAssignedIdentity"

  runtime_name    = "python"
  runtime_version = "3.10"

  maximum_instance_count = 100
  instance_memory_in_mb  = 2048

  https_only              = true
  client_certificate_mode = "Required"

  app_settings = var.app_settings

  sticky_settings {

    app_setting_names = keys(var.app_settings)

  }

  identity {

    type = "SystemAssigned"

  }

  site_config {

    cors {

      allowed_origins = ["https://portal.azure.com"]

    }

  }

}

resource "azurerm_role_assignment" "host_blob" {

  scope = replace(
    var.host_storage_account_id,
    "resourceGroups",
    "resourcegroups"
  )

  role_definition_name = "Storage Blob Data Owner"
  principal_id         = azurerm_function_app_flex_consumption.this.identity[0].principal_id
  principal_type       = "ServicePrincipal"

}

resource "azurerm_role_assignment" "host_queue" {

  scope                = var.host_storage_account_id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.this.identity[0].principal_id
  principal_type       = "ServicePrincipal"

}

resource "azurerm_role_assignment" "host_table" {

  scope                = var.host_storage_account_id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.this.identity[0].principal_id
  principal_type       = "ServicePrincipal"

}

resource "azurerm_role_assignment" "data_storage" {

  scope                = var.data_storage_account_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_function_app_flex_consumption.this.identity[0].principal_id
  principal_type       = "ServicePrincipal"

}

output "id" {

  value = azurerm_function_app_flex_consumption.this.id

}

output "principal_id" {

  value = azurerm_function_app_flex_consumption.this.identity[0].principal_id

}