---
title: OpenSearch Dashboards
---

# OpenSearch Dashboards

OpenSearch Dashboards is the user interface that lets you visualize your OpenSearch data and run and scale your OpenSearch clusters.

## Getting started

| Concept | Description | 
|---------|-------------|
| [OpenSearch Dashboards Quickstart](/dashboards/quickstart) | Learn about the basic concepts and features of OpenSearch Dashboards. |
| [OpenSearch Playground](https://playground.opensearch.org/app/home#/) | Explore features in OpenSearch Dashboards without downloading or installing anything. |
| [Install and configure OpenSearch Dashboards](/install-and-configure/install-dashboards/) | Get started with OpenSearch Dashboards. | 
| [Create visualizations](/dashboards/visualize/viz-index) | Learn about visualizing data in OpenSearch Dashboards. |
| [Explore and query data](/dashboards/discover/index-discover) | Learn how to explore and query data in OpenSearch. |

## Query languages

Query language | Where you can use it | Description
:--- | :--- | :---
[Query domain-specific language (DSL)](/query-dsl/) | [Dev Tools](/dashboards/dev-tools/index-dev) | The primary OpenSearch query language that supports creating complex, fully customizable queries.
[Dashboards Query Language (DQL)](/dashboards/dql) | [Discover](/dashboards/discover/index-discover) and [Dashboard](/dashboards/dashboard/) search bar | A simple text-based query language used to filter data in OpenSearch Dashboards. 
[Query string query language](/query-dsl/full-text/query-string) | [Discover](/dashboards/discover/index-discover) and [Dashboard](/dashboards/dashboard/) search bar | A scaled-down query language whose syntax is based on the Apache Lucene query syntax.
[SQL](/search-plugins/sql/sql/) | [Query Workbench](/dashboards/query-workbench) | A traditional query language that bridges the gap between relational database concepts and the flexibility of OpenSearch’s document-oriented data storage.
[Piped Processing Language (PPL)](/search-plugins/sql/ppl/) | [Query Workbench](/dashboards/query-workbench) | The primary language used with observability in OpenSearch. PPL uses a pipe syntax that chains commands into a query.

### Discover and Dashboard search bar

Using the search bar in the [Discover](/dashboards/discover/index-discover) and [Dashboard](/dashboards/dashboard/) apps, you can search data with the following two languages:

- [DQL](/dashboards/dql) 

- [Query string query (Lucene)](/query-dsl/full-text/query-string)

The following table compares DQL and query string query language features.

DQL and query string query language | DQL | Query string query language
:--- | :--- | :---
- Wildcard expressions (DQL supports `*` only)<br> - Ranges<br> - Boolean operations<br> | - Querying nested fields | - Regular expressions<br> - Fuzziness<br> - Proximity queries<br> - Boosting

By default, the query language in the Discover search toolbar is DQL. To switch to query string syntax, select **DQL** and then turn off **OpenSearch Dashboards Query Language**. The query language changes to `Lucene`, as shown in the following image.

![Using query string syntax in OpenSearch Dashboards Discover](/images/discover-lucene-syntax.png)

## Observability

| Concept | Description | 
|---------|-------------|
| [Observability in OpenSearch Dashboards](//observing-your-data/index/) | Observe, monitor, and secure data and improve performance across tools and workflows. |

## Dashboards Management

| Concept | Description | 
|---------|-------------|
| [Dashboards Management](/dashboards/management/management-index) | Learn about the command center for customizing your OpenSearch Dashboards behavior, creating index patterns, and configuring data sources. |

## Dev Tools 

| Concept | Description |
|---------|-------------|
| [Dev Tools](/dashboards/dev-tools/index-dev) | Learn how to run OpenSearch queries in an integrated console. |
