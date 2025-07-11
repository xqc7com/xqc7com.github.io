---
categories:
- 默认分类
date: '2024-11-25T16:57:38'
description: ''
draft: false
image: ''
slug: redis-cluster
tags:
- redis
title: 搭建redis集群
---

当前有三个节点 10.32.5.41，10.32.5.81，10.32.5.88

在每个节点上启动两套redis服务，分别监听7000以及7001端口，其他的配置一致

两套服务分别在处于不同的路径下，按官方文档修改最小配置

```shell
port 7000
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
```

修改完配置之后，执行命令分别启动所有的redis服务 ./bin/redis-server ./conf/redis.conf

服务启动后，现在每个节点都是独立的，并没有关联起来，需要执行命令使它们绑定依赖；

在其中的一个节点上执行以下命令，执行完毕后输出节点集群信息

```shell
./redis-cli --cluster create 10.32.5.41:7000 10.32.5.41:7001 10.32.5.81:7000 10.32.5.81:7001 \
    10.32.5.88:7000 10.32.5.88:7001 --cluster-replicas 1
```
