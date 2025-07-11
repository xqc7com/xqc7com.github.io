---
categories:
- 默认分类
date: '2024-12-30T14:20:00'
description: ''
draft: false
image: ''
slug: zookeeper-deploy
tags:
- zookeeper
title: 接入zookeeper进行主从切换
---

## 部署zookeeper服务端

下载最新版本的zookeeper执行文件 [https://archive.apache.org/dist/zookeeper/zookeeper-3.7.0/](https://archive.apache.org/dist/zookeeper/zookeeper-3.7.0/)

将下载的包解压到 /usr/local/apache-zookeeper-3.7.0-bin 目录下，将conf下的zoo_sample.cfg复制一份并重命名为zoo.cfg

### 修改配置

增加data目录，并修改zoo.cfg的数据文件目录配置项 dataDir=/usr/local/apache-zookeeper-3.7.0-bin/data

在zoo.cfg文件的最后增加配置项

```
server.1=10.32.5.41:2888:3888
server.2=10.32.5.81:2888:3888
server.3=10.32.5.88:2888:3888
```

在/usr/local/apache-zookeeper-3.7.0-bin/data目录增加文件名称为 myid 的文件，文件内容和前面地址配置项id一致

如当前机器ip地址为10.32.5.88，那么文件 myid 的内容应该为3

### 启动服务

每个节点进入bin目录，使用命令启动服务 ./zkServer.sh start，全部节点启动完毕后，至此zookeeper的集群部署完毕

### 集群查看

使用status参数可以查看当前节点的从属状态

### 创建目录

使用zkCli.sh连接集群，连接后使用命令 create /datacenter 进行创建数据目录节点，主要为了后面客户端进行选主使用

## 服务端集成zookeeper的c库

源代码下载，编译c版本lib库 [https://github.com/apache/zookeeper](https://github.com/apache/zookeeper)，

参照 README_packaging.md 文件编译指引

在源码根目录执行

```shell
mvn clean -Pfull-build
mvn install -Pfull-build -DskipTests
```

### 主从切换原理

客户端consumer使用zkclient库来进行主从切换（zkclient参考 [https://github.com/owenliang/zkclient）](https://github.com/owenliang/zkclient%EF%BC%89)

主从切换的主要原理是利用 zookeeper文件系统的一致性以及客户端通知机制

客户端启动的时候创建一个 sequence + ephemeral目录节点（基于共同根目录 /datacenter）

目录节点的数据内容为一个唯一的nodeid值

然后获取到当前根目录/datacenter下的所有子目录，存储到本地排序后，将排序后的第一个节点确认为master节点

sequence 保证每次创建的目录都是严格递增的

ephemeral 保证创建目录的客户端在断开后session-timeout的时间后会被自动删除

客户端启动的时候进行监听，这样zookeeper在每次有节点断开的时候，都会通知到所有的客户端，通过通知机制进行检查以及切换主从
