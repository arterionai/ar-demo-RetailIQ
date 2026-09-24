targetScope = 'resourceGroup'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Azure region for Static Web Apps. eastus does not support Microsoft.Web/staticSites.')
param staticWebAppsLocation string = 'eastus2'

@description('Deployment environment name used in resource naming.')
param environmentName string = 'demo'

@description('Logical service name for the API.')
param serviceName string = 'retailiq-returns-api'

@description('App Service Plan SKU.')
param appServicePlanSku string = 'B1'

var uniqueSuffix = uniqueString(resourceGroup().id, environmentName, serviceName)
var legacyStaticUniqueSuffix = uniqueString(resourceGroup().id, environmentName, 'palacio-returns-api')
var resourcePrefix = 'retailiq-returns-${environmentName}'
var legacyStaticResourcePrefix = 'palacio-returns-${environmentName}'
var appServicePlanName = '${resourcePrefix}-plan-${uniqueSuffix}'
var webAppName = '${resourcePrefix}-api-${uniqueSuffix}'
var miPalacioStaticName = '${legacyStaticResourcePrefix}-mi-${legacyStaticUniqueSuffix}'
var operationsStaticName = '${legacyStaticResourcePrefix}-ops-${legacyStaticUniqueSuffix}'
var logAnalyticsName = '${resourcePrefix}-law-${uniqueSuffix}'
var appInsightsName = '${resourcePrefix}-appi-${uniqueSuffix}'
var tags = {
  application: 'RetailIQ Returns'
  environment: environmentName
  workload: 'demo'
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  tags: tags
  sku: {
    name: appServicePlanSku
    tier: appServicePlanSku == 'B1' ? 'Basic' : 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource miPalacioStatic 'Microsoft.Web/staticSites@2022-09-01' = {
  name: miPalacioStaticName
  location: staticWebAppsLocation
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    provider: 'Custom'
  }
}

resource operationsStatic 'Microsoft.Web/staticSites@2022-09-01' = {
  name: operationsStaticName
  location: staticWebAppsLocation
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    provider: 'Custom'
  }
}

resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'DEMO_ALLOWED_ORIGINS'
          value: 'https://${miPalacioStatic.properties.defaultHostname},https://${operationsStatic.properties.defaultHostname}'
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

output appName string = webApp.name
output appHostName string = webApp.properties.defaultHostName
output appUrl string = 'https://${webApp.properties.defaultHostName}'
output applicationInsightsName string = appInsights.name
output miPalacioStaticName string = miPalacioStatic.name
output miPalacioUrl string = 'https://${miPalacioStatic.properties.defaultHostname}'
output operationsStaticName string = operationsStatic.name
output operationsUrl string = 'https://${operationsStatic.properties.defaultHostname}'
