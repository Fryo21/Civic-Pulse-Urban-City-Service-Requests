variable "resource_group_name" {
  description = "Name of the resource group to deploy into"
  type        = string
}

variable "location" {
  description = "Azure region for the Data Factory"
  type        = string
}

variable "name" {
  description = "Name of the Azure Data Factory"
  type        = string
}
