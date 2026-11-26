---
title: Force merge
---

# Force merge
<Badge type="tip" text="Introduced 2.6" />

OpenSearch Dashboards allows you to perform a [force merge](/im-plugin/ism/error-prevention/#force_merge) operation on two or more indexes with **Index Management**.

## Force merging indexes

To perform a force merge operation on two or more indexes, perform the following steps:

1. Under **Index Management**, choose **Indices**.

1. Select the indexes you want to force merge.

1. Choose **Actions**, and then choose **Force merge**, as shown in the following image.

    ![Force Merge](/images/admin-ui-index/forcemerge1.png)

1. Under **Configure source index**, specify the indexes you want to force merge.

1. Optionally, under **Advanced settings** you can to choose to **Flush indices** or **Only expunge delete** and then specify the **Max number of segments** to merge to as shown in the following image.

    ![Force Merge](/images/admin-ui-index/forcemerge2.png)

## Force merging data streams

To perform a force merge operation on two or more indexes, perform the following steps:

1. Under **Index Management**, choose **Data streams**.

1. Select the data streams you want to force merge.

1. Choose **Actions**, and then choose **Force merge**.

1. Under **Configure source index**, specify the data streams you want to force merge.

1. Optionally, under **Advanced settings** you can to choose to **Flush indices** or **Only expunge delete** and then specify the **Max number of segments** to merge to as shown in the following image.

    ![Force Merge](/images/admin-ui-index/forcemerge2.png)
