terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.55.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.AZURE_SUBSCRIPTION_ID
  tenant_id = var.AZURE_TENANT_ID
  client_id = var.AZURE_CLIENT_ID
  client_secret = var.AZURE_CLIENT_SECRET
}


locals {
	project_name = "zenwealth"
    resource_prefix = "ck-${local.project_name}"
    location = "uksouth"
    data_location = "UK"
}


resource "azurerm_resource_group" "rg" {
  location = local.location
  name     = local.project_name
}
