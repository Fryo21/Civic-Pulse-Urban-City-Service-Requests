variable "resource_group_name" {
  description = "Name of the resource group to deploy into"
  type        = string
}

variable "data_factory_id" {
  description = "ID of the Data Factory to monitor"
  type        = string
}

variable "email_address" {
  description = "Email address to notify on pipeline alerts"
  type        = string
}
