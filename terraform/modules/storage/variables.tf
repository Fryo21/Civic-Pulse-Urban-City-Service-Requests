variable "resource_group_name" {
  description = "Name of the resource group to deploy into"
  type        = string
}

variable "location" {
  description = "Azure region for the storage accounts"
  type        = string
}

variable "primary_name" {
  description = "Name of the primary storage account"
  type        = string
}

variable "additional_name" {
  description = "Name of the additional storage account"
  type        = string
}
