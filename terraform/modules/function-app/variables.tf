variable "resource_group_name" {
  description = "Name of the resource group to deploy into"
  type        = string
}

variable "location" {
  description = "Azure region for the Function App"
  type        = string
}

variable "name" {
  description = "Name of the Azure Function App"
  type        = string
}

variable "service_plan_name" {
  description = "Name of the App Service Plan backing the Function App"
  type        = string
}

variable "storage_account_name" {
  description = "Name of the storage account used by the Function App"
  type        = string
}

variable "app_settings" {
  description = "Application settings for the Function App"
  type        = map(string)
}
