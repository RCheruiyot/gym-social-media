output "backend_url" {
  value = aws_api_gateway_deployment.backend_api.invoke_url
}

output "frontend_url" {
  value = aws_s3_bucket.frontend_bucket.website_endpoint
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.main.name
}