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

output "primary_name" {
  value = azurerm_storage_account.primary.name
}

output "additional_name" {
  value = azurerm_storage_account.additional.name
}

output "additional_id" {
  value = azurerm_storage_account.additional.id
}
