resource "azurerm_monitor_action_group" "pipeline" {
  name                = "London Factory Pipeline"
  resource_group_name = var.resource_group_name
  short_name          = "Factory"

  email_receiver {
    email_address           = var.email_address
    name                    = "Email0_-EmailAction-"
    use_common_alert_schema = true
  }

  tags = {}
}

resource "azurerm_monitor_metric_alert" "update" {
  name                = "Update"
  resource_group_name = var.resource_group_name
  description         = ""
  severity            = 3
  enabled             = true
  frequency           = "PT15M"
  window_size         = "PT1H"
  auto_mitigate       = true

  scopes = [var.data_factory_id]

  criteria {
    metric_namespace = "Microsoft.DataFactory/factories"
    metric_name      = "PipelineFailedRuns"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 0

    dimension {
      name     = "Name"
      operator = "Include"
      values   = ["*"]
    }
  }

  action {
    action_group_id = azurerm_monitor_action_group.pipeline.id
  }

  depends_on = [azurerm_monitor_action_group.pipeline]

  tags = {}
}

output "action_group_id" {
  value = azurerm_monitor_action_group.pipeline.id
}
