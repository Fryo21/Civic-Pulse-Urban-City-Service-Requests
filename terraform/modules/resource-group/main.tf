resource "azurerm_resource_group" "this" {
  name     = var.name
  location = var.location

  lifecycle {
    # The live resource group's location metadata (ukwest) doesn't match
    # var.location (norwayeast, where every resource inside it actually
    # lives). Azure won't let an RG's location change in place, so ignore
    # drift on this attribute rather than force a destroy/recreate.
    ignore_changes = [location]
  }
}

output "name" {
  value = azurerm_resource_group.this.name
}

output "id" {
  value = azurerm_resource_group.this.id
}
