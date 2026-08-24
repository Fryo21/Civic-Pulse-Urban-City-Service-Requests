variable "resource_group_name" {

  description = "Name of the Azure resource group"
  type        = string

}

variable "location" {

  description = "Azure region for all resources"
  type        = string

}

variable "storage_primary_name" {

  description = "Primary storage account name"
  type        = string

}

variable "storage_additional_name" {

  description = "Secondary storage account name"
  type        = string

}

variable "data_factory_name" {

  description = "Azure Data Factory name"
  type        = string

}

variable "postgres_server_name" {

  description = "Azure PostgreSQL Flexible Server name"
  type        = string

}

variable "postgres_administrator_login" {

  description = "Administrator login for PostgreSQL Flexible Server"
  type        = string

}

variable "postgressql_admin_password" {

  description = "Administrator password for PostgreSQL Flexible Server"
  type        = string
  sensitive   = true

}

variable "postgres_sku_name" {

  description = "SKU for PostgreSQL Flexible Server"
  type        = string

}

variable "postgres_storage_mb" {

  description = "Storage size in MB for PostgreSQL Flexible Server"
  type        = number

}

variable "function_app_name" {

  description = "Azure Function App name"
  type        = string

}

variable "function_app_service_plan_name" {

  description = "Azure Function App service plan name"
  type        = string

}

variable "monitor_email_address" {

  description = "Email address used by the monitoring action group"
  type        = string

}