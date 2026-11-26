---
title: Dashboards Management
---

# Dashboards Management
<Badge type="tip" text="Introduced 2.10" />

**Dashboards Management** serves as the command center for customizing OpenSearch Dashboards to your needs. A view of the interface is shown in the following image.

<img src="/images/dashboards/dashboards-management-ui.png" alt="Dashboards Management interface" width="700"/>

::: info NOTE
<img src="/images/icons/alert-icon.png" class="inline-icon" alt="alert icon"/> **Note**<br>OpenSearch and OpenSearch Dashboards privileges govern access to individual features. If you do not have the appropriate access, consult your administrator. 
:::

## Applications

The following applications are available in **Dashboards Management**:

- **[Index Patterns](/dashboards/management/index-patterns):** To access OpenSearch data, you need to create an index pattern so that you can select the data you want to use and define the properties of the fields. The Index Pattern tool gives you the ability to create an index pattern from within the UI. Index patterns point to one or more indexes, data streams, or index aliases. 
- **[Data Sources](/dashboards/management/multi-data-sources):** The Data Sources tool is used to configure and manage the data sources that OpenSearch uses to collect and analyze data. You can use the tool to specify the source configuration in your copy of the [OpenSearch Dashboards configuration file](https://github.com/opensearch-project/OpenSearch-Dashboards/blob/main/config/opensearch_dashboards.yml).
- **[Saved Objects](https://opensearch.org/blog/enhancement-multiple-data-source-import-saved-object/):** The Saved Objects tool helps you organize and manage your saved objects. Saved objects are files that store data, such as dashboards, visualizations, and maps, for later use.
- **[Advanced Settings](/dashboards/management/advanced-settings):** The Advanced Settings tool gives you the flexibility to personalize the behavior of OpenSearch Dashboards. The tool is divided into settings sections, such as General, Accessibility, and Notifications, and you can use it to customize and optimize many of your Dashboards settings.
