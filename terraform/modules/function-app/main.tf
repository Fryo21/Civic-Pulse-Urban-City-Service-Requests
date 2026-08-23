resource "azurerm_service_plan" "this" {
  name                = var.service_plan_name
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "FC1"
}

resource "azurerm_linux_function_app" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location

  storage_account_name = var.storage_account_name
  service_plan_id      = azurerm_service_plan.this.id

  functions_extension_version = "~4"
  builtin_logging_enabled     = false
  client_certificate_mode     = "Required"
  https_only                  = true

  app_settings = var.app_settings

  sticky_settings {
    app_setting_names = keys(var.app_settings)
  }

  site_config {
    ftps_state                        = "FtpsOnly"
    ip_restriction_default_action     = "Allow"
    scm_ip_restriction_default_action = "Allow"

    cors {
      allowed_origins = ["https://portal.azure.com"]
    }
  }

  identity {
    type = "SystemAssigned"
  }
}

output "id" {
  value = azurerm_linux_function_app.this.id
}
