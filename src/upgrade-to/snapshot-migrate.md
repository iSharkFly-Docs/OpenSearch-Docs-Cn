---
title: Using snapshots to migrate data
---

# Using snapshots to migrate data

One popular approach is to take a [snapshot](/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore) of your Elasticsearch OSS 6.x or 7.x indexes, [create an OpenSearch cluster](/install-and-configure/install-opensearch/), restore the snapshot on the new cluster, and point your clients to the new host.

The snapshot approach can mean running two clusters in parallel, but lets you validate that the OpenSearch cluster is working in a way that meets your needs prior to modifying the Elasticsearch OSS cluster.
