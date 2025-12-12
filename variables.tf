variable "AZURE_SUBSCRIPTION_ID" {
  type = string
}

variable "AZURE_TENANT_ID" {
  type = string
}

variable "AZURE_CLIENT_SECRET" {
  type = string
}

variable "AZURE_CLIENT_ID" {
  type = string
}

variable "custom_domain_name" {
  type    = string
}

variable "domain_verified" {
  type = bool
  default = false
}