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

variable "deployment_container_endpoint" {

  description = "Endpoint URL for the Function App deployment container"
  type        = string

}

variable "host_storage_account_id" {

  description = "Storage account ID used by the Function host and Durable Functions"
  type        = string

}

variable "data_storage_account_id" {

  description = "Storage account ID used for the Bronze data lake"
  type        = string

}

variable "app_settings" {

  description = "Application settings for the Function App"
  type        = map(string)

}