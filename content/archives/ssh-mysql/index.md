---
categories:
- 建站技能
date: '2025-02-15T18:29:13'
description: ''
draft: false
image: ''
slug: ssh-mysql
tags:
- mysql
- ssh
title: 本地通过隧道连接服务器的mysql
cover: /archives/ssh-mysql/u1hmro.png
---

## 前言

服务器上部署了 mysql，本地希望能访问该 mysql，但是又不希望 mysql 直接暴露在公网上

那么可以通过隧道连接 ssh 端口的方式进行连接 

从外网看，服务器只开放了一个 ssh 端口，并没有开放 3306 监听端口


## 设置本地免密登录

这个之前写过，有不清楚的可以看 [这里](https://www.xqc7.com/archives/login-ssh-without-password)

设置好之后，本地就不需要密码，直接 `ssh root@xx.xx.xx.xx` 登录到服务器了


## 建立隧道 

本地使用以下命令，来通过 ssh 建立本地到服务器的一个连接通道，将本地的 33060 映射到服务器的 3306 端口

连接本地的 33060 端口，就相当于连接了服务器的 3306 端口

如果需要更详细的输出日志，可以增加 ssh 的参数 `-v` 或 `-vv` 、`-vvv`，v 越多日志越详细

```shell
ssh -N -v -L 33060:127.0.0.1:3306 user@your_server_ip
```

建议不需要带 v 参数，都是 ssh 的日志，也没什么看的，不带 v 是没有日志输出的

![](/archives/ssh-mysql/u1hmro.png)

但是因为 ssh 隧道极其不稳定，可以用 autossh 替代，使用上基本一致，增加 M 参数监控端口，会进行断开自动重连

```shell
autossh -M 5000 -N -v -L 33060:127.0.0.1:3306 user@your_server_ip
```

## 本地连接数据库

在上面隧道建立起来之后，运行 dbeaver，配置连接本地的 33060 端口

输入数据库的账号密码，点击测试连接显示已连接

![](/archives/ssh-mysql/u3696j.png)


## 最终配置

开始没留意，后来发现其实 dbeaver 中就已经实现了 ssh 的隧道功能，这样就不需要单独额外启动 ssh 隧道了

dbeaver 配置分两步，一是设置 ssh 的配置，一是设置 mysql 的配置

前提是本地的公钥已经配置到服务器的 authorized_keys 文件中了，也可以通过输入密码账号的方式连接 ssh

新建连接，在 “SSH” 的标签页上，认证方式使用公钥，并选择本地的私钥，配置好服务器地址以及端口信息

![](/archives/ssh-mysql/h1g09n.png)

切换回到 “主要” 标签页，主机填 localhost，端口就是服务器的 3306 端口，输入账号密码，测试连接 OK

![](/archives/ssh-mysql/h33hqc.png)


