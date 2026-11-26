---
title: Language clients
---

# OpenSearch language clients

OpenSearch provides clients in JavaScript, Python, Ruby, Java, PHP, .NET, Go and Rust.

## OpenSearch clients

OpenSearch provides clients for the following programming languages and platforms: 

* **Python**
  * [OpenSearch high-level Python client](/clients/python-high-level)
  * [OpenSearch low-level Python client](/clients/python-low-level)
  * [`opensearch-py-ml` client](/clients/opensearch-py-ml)
* **Java**
  * [OpenSearch Java client](/clients/java)
* **JavaScript**
  * [OpenSearch JavaScript (Node.js) client](/clients/javascript/)
* **Go**
  * [OpenSearch Go client](/clients/go)
* **Ruby**
  * [OpenSearch Ruby client](/clients/ruby)
* **PHP**
  * [OpenSearch PHP client](/clients/php)
* **.NET**
  * [OpenSearch .NET clients](/clients/dot-net)
* **Rust**
  * [OpenSearch Rust client](/clients/rust)
* **Hadoop**
  * [OpenSearch Hadoop client](https://github.com/opensearch-project/opensearch-hadoop) 

::: info NOTE
For a client compatibility matrix, see the COMPATIBILITY.md file in the client's repository.
:::

::: danger WARNING
The OpenSearch Java high-level REST client will be deprecated starting with OpenSearch version 3.0.0 and will be removed in a future release. We recommend switching to the [Java client](/clients/java) instead.
:::

## Legacy clients

Most clients that work with Elasticsearch OSS 7.10.2 *should* work with OpenSearch, but the latest versions of those clients might include license or version checks that artificially break compatibility. This page includes recommendations around which versions of those clients to use for best compatibility with OpenSearch.

::: info NOTE
For a client compatibility matrix, see the COMPATIBILITY.md file in the client's repository.
:::

Client | Recommended version
:--- | :---
[Elasticsearch Java low-level REST client](https://search.maven.org/artifact/org.elasticsearch.client/elasticsearch-rest-client/7.13.4/jar) | 7.13.4
[Elasticsearch Java high-level REST client](https://search.maven.org/artifact/org.elasticsearch.client/elasticsearch-rest-high-level-client/7.13.4/jar) | 7.13.4
[Elasticsearch Python client](https://pypi.org/project/elasticsearch/7.13.4/) | 7.13.4
[Elasticsearch Node.js client](https://www.npmjs.com/package/@elastic/elasticsearch/v/7.13.0) | 7.13.0
[Elasticsearch Ruby client](https://rubygems.org/gems/elasticsearch/versions/7.13.0) | 7.13.0

If you test a legacy client and verify that it works, please [submit a PR](https://github.com/opensearch-project/documentation-website/pulls) and add it to this table.
