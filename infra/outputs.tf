output "public_ip" {
  description = "Elastic IP of the server"
  value       = aws_eip.app.public_ip
}

output "instance_id" {
  value = aws_instance.app.id
}