variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Used to name/tag resources"
  type        = string
  default     = "school-system"
}

variable "instance_type" {
  description = "EC2 instance size"
  type        = string
  default     = "t3.small"
}

variable "key_pair_name" {
  description = "Name of an EXISTING EC2 key pair (created via console) to allow SSH access"
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH in (0.0.0.0/0 = anywhere, since Fail2ban + key-only auth handle security)"
  type        = string
  default     = "0.0.0.0/0"
}