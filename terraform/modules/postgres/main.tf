resource "azurerm_postgresql_flexible_server" "this" {
  name                   = var.name
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "18"
  administrator_login    = var.administrator_login
  administrator_password = var.administrator_password
  storage_mb             = var.storage_mb
  sku_name               = var.sku_name
  zone                   = "1"

  tags = {}

  lifecycle {
    ignore_changes = [administrator_password]
  }
}

output "id" {
  value = azurerm_postgresql_flexible_server.this.id
}
