variable "resource_group_name" {
  description = "Name of the resource group to deploy into"
  type        = string
}

variable "location" {
  description = "Azure region for the PostgreSQL Flexible Server"
  type        = string
}

variable "name" {
  description = "Name of the PostgreSQL Flexible Server"
  type        = string
}

variable "administrator_login" {
  description = "Administrator login for the PostgreSQL Flexible Server"
  type        = string
}

variable "administrator_password" {
  description = "Administrator password for the PostgreSQL Flexible Server"
  type        = string
  sensitive   = true
}

variable "sku_name" {
  description = "SKU for the PostgreSQL Flexible Server"
  type        = string
}

variable "storage_mb" {
  description = "Storage size in MB for the PostgreSQL Flexible Server"
  type        = number
}
