output "domain_verification_records" {
  value = azurerm_email_communication_service_domain.email-svc-domain.verification_records
}

output "communication_service_connection_string" {
  value = azurerm_communication_service.comm_svc.primary_connection_string
  sensitive = true
}