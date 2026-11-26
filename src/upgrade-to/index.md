---
title: About the migration process
---

# About the migration process

The process of migrating from Elasticsearch OSS to OpenSearch varies depending on your current version of Elasticsearch OSS, installation type, tolerance for downtime, and cost-sensitivity. Rather than concrete steps to cover every situation, we have general guidance for the process.

Three approaches exist:

- Use a snapshot to [migrate your Elasticsearch OSS data](/upgrade-to/snapshot-migrate) to a new OpenSearch cluster. This method may incur downtime.
- Perform a [restart upgrade or a rolling upgrade](/upgrade-to/upgrade-to) on your existing nodes. A restart upgrade involves upgrading the entire cluster and restarting it, whereas a rolling upgrade requires upgrading and restarting nodes in the cluster one by one.
- Replace existing Elasticsearch OSS nodes with new OpenSearch nodes. Node replacement is most popular when upgrading [Docker clusters](/upgrade-to/docker-upgrade-to).

Regardless of your approach, to safeguard against data loss, we recommend that you take a [snapshot](/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore) of all indexes prior to any migration.

If your existing clients include a version check, such as recent versions of Logstash OSS and Filebeat OSS, [check compatibility](/tools/#compatibility-matrices) before upgrading.

For more information about OpenSearch migration tools, see [OpenSearch upgrade, migration, and comparison tools](/tools/#opensearch-upgrade-migration-and-comparison-tools).

## Upgrading from Open Distro

For steps to upgrade from Open Distro to OpenSearch, refer to the blog post [How To: Upgrade from Open Distro to OpenSearch](https://opensearch.org/blog/technical-posts/2021/07/how-to-upgrade-from-opendistro-to-opensearch/).
