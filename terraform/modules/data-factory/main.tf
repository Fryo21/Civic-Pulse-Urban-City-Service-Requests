resource "azurerm_data_factory" "this" {
  name                            = var.name
  resource_group_name             = var.resource_group_name
  location                        = var.location
  managed_virtual_network_enabled = true

  identity {
    type = "SystemAssigned"
  }

  tags = {}
}

output "id" {
  value = azurerm_data_factory.this.id
}
