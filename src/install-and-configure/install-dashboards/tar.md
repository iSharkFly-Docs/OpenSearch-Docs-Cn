---
title: Tarball
---

# Run OpenSearch Dashboards using the tarball

1. Download the tarball from the [OpenSearch downloads page](https://opensearch.org/downloads.html).

1. Extract the TAR file to a directory and change to that directory:

   ```bash
   # x64
   tar -zxf opensearch-dashboards-2.12.0-linux-x64.tar.gz
   cd opensearch-dashboards
   # ARM64
   tar -zxf opensearch-dashboards-2.12.0-linux-arm64.tar.gz
   cd opensearch-dashboards
   ```

1. If desired, modify `config/opensearch_dashboards.yml`.

1. Run OpenSearch Dashboards:

   ```bash
   ./bin/opensearch-dashboards
   ```
