resource "azurerm_storage_account" "primary" {

  name                            = var.primary_name
  resource_group_name             = var.resource_group_name
  location                        = var.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = false
  default_to_oauth_authentication = true
  shared_access_key_enabled       = false

}

resource "azurerm_storage_account" "additional" {

  name                            = var.additional_name
  resource_group_name             = var.resource_group_name
  location                        = var.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  allow_nested_items_to_be_public = false
  default_to_oauth_authentication = true
  shared_access_key_enabled       = false

}

resource "azurerm_storage_container" "function_deployment" {

  name                  = "app-package-fa-crime-extraction-ebbb63a"
  storage_account_id    = azurerm_storage_account.additional.id
  container_access_type = "private"

}

output "primary_name" {

  value = azurerm_storage_account.primary.name

}

output "primary_id" {

  value = azurerm_storage_account.primary.id

}

output "additional_name" {

  value = azurerm_storage_account.additional.name

}

output "additional_id" {

  value = azurerm_storage_account.additional.id

}

output "deployment_container_endpoint" {

  value = "${azurerm_storage_account.additional.primary_blob_endpoint}${azurerm_storage_container.function_deployment.name}"

}