variable "aws_region" {
  description = "AWS region in which to create the EC2 instance."
  type        = string
  default     = "us-east-1"
}

variable "name" {
  description = "Name prefix for the EC2 instance and security group."
  type        = string
  default     = "liver-segmentation-ml"
}

variable "instance_type" {
  description = "CPU-only instance size. t3a.medium is a practical starting point for PyTorch."
  type        = string
  default     = "t3a.medium"
}

variable "ssh_key_name" {
  description = "Name of an existing EC2 key pair in the selected AWS region."
  type        = string
}

variable "admin_cidr" {
  description = "IPv4 CIDR allowed to SSH to the instance, e.g. your-public-ip/32."
  type        = string

  validation {
    condition     = can(cidrnetmask(var.admin_cidr))
    error_message = "admin_cidr must be a valid IPv4 CIDR range."
  }
}

variable "api_allowed_cidr" {
  description = "IPv4 CIDR allowed to call the API. Use a trusted client IP range."
  type        = string

  validation {
    condition     = can(cidrnetmask(var.api_allowed_cidr))
    error_message = "api_allowed_cidr must be a valid IPv4 CIDR range."
  }
}
