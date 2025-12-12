resource "azurerm_communication_service" "comm_svc" {
  name                = "${local.resource_prefix}-comm-svc"
  resource_group_name = azurerm_resource_group.rg.name
  data_location       = local.data_location
}

resource "azurerm_email_communication_service" "email-svc" {
  name                = "${local.resource_prefix}-email-svc"
  resource_group_name = azurerm_resource_group.rg.name
  data_location       = local.data_location
}

resource "azurerm_email_communication_service_domain" "email-svc-domain" {
  name             = var.custom_domain_name
  email_service_id = azurerm_email_communication_service.email-svc.id

  domain_management = "CustomerManaged"
}

/*
IMPORTANT:
Before the below resources can be created, the custom domain must be verified.

You can verify the domain through the Azure Portal by going to the Email Communication Service resource,
selecting "Settings > Provision Domains", and following the instructions to add the required records to your DNS provider.

Once the domain is verified and the required SPF & DKIM records have been added and verifired,
you can create the domain association and sender username by setting the domain_verified variable to true.
*/

resource "azurerm_communication_service_email_domain_association" "comm-svc-email-domain-assoc" {
  count = var.domain_verified ? 1 : 0

  communication_service_id = azurerm_communication_service.comm_svc.id
  email_service_domain_id  = azurerm_email_communication_service_domain.email-svc-domain.id
}

resource "azurerm_email_communication_service_domain_sender_username" "email-svc-domain-sender-username" {
  count = var.domain_verified ? 1 : 0

  name                    = local.project_name
  email_service_domain_id = azurerm_email_communication_service_domain.email-svc-domain.id
  display_name            = local.project_name
}