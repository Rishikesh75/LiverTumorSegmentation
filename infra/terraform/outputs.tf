output "instance_id" {
  description = "ID of the ML service EC2 instance."
  value       = aws_instance.ml_service.id
}

output "instance_public_ip" {
  description = "Public IPv4 address of the ML service."
  value       = aws_instance.ml_service.public_ip
}

output "api_url" {
  description = "Base URL of the ML service API."
  value       = "http://${aws_instance.ml_service.public_ip}:5001"
}
