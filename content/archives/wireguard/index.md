---
categories:
- 默认分类
date: '2025-03-10T12:58:55'
description: ''
draft: false
image: ''
slug: wireguard
tags:
- ubuntu
- wireguard
title: 通过wireguard进行组网
cover: /archives/wireguard/isfl2m.png
---

## 前言

服务器 ubuntu 节点在公网，希望和本地 win10 节点组成局域网，需要部署 OpenVPN 或 WireGuard 同类的服务进行组网

作为开源产品，OpenVPN 历史悠久，代码量庞大，功能也更为复杂，比较适合企业进行部署

WireGuard 相对更为轻量，比较适合个人开发者进行部署，以及在服务器资源有限的环境进行部署

## 安装

从官方地址 https://www.wireguard.com/install/ 下载对应平台的安装版本

ubuntu 通过 `apt install wireguard` 命令进行安装

完整手册 https://www.wireguard.com/quickstart ，中文版本手册 https://zh-wireguard.com/quickstart/ 

## 服务端部署

在 /etc/wireguard/ 目录生成服务端的公私钥文件

```shell
umask 077
wg genkey | tee /etc/wireguard/server.key | wg pubkey > /etc/wireguard/server.key.pub
```

新建文件 /etc/wireguard/wg0.conf 并配置设置如下

```conf
[Interface]
PrivateKey = GPKx49......
Address = 192.168.0.1/24
ListenPort = 22

[Peer]
PublicKey = 5AY6oP......
AllowedIPs = 192.168.0.2/32
```

### Interface部分

配置的 PrivateKey 是前面生成的私钥 server.key 的文本内容

Address 表示将和 Peer （也就是本地 win10 端）组成局域网的 ubuntu 的虚拟网卡 ip 地址

ListenPort 表示服务端的 UDP 监听端口，需要在 ufw 防火墙，以及云厂商的安全策略中将端口放行

### Peer部分

需要预先生成客户端的信息，然后在这里进行填入，如果有多个 clinet 节点进行组网，需要设置多个 Peer 配置块

PublicKey 需要填入 Peer 端（也就是本地 win10 端）的公钥

AllowedIPs 表示客户端 win10 的组网地址，需要和 Interface 部分的 Address 属于同一个网段


### 流量转发

对于一些公司的组网情况，可能还会限制网络流量的出口，必须流经服务器，以便对流量进行监控

那么就需要配置服务端的 ip 转发以及 NAT 转发，在这里仅仅只是组网，不需要对本地的公网流量进行限制

如果其中一个客户端需要访问另外一个客户端，那么需要在修改 ufw 的配置，使得内网流量可以转发

在 /etc/default/ufw 文件中，修改 `DEFAULT_FORWARD_POLICY="ACCEPT"`，并重启生效 `systemctl restart ufw`


### 启动服务端

使用命令 `systemctl start wg-quick@wg0` 启动网卡，status 和 restart 查看以及重启网卡

也可以使用 `wg-quick up wg0` 和 `wg-quick down wg0` 来启停网卡， `wg show` 查看配置情况 

![](/archives/wireguard/isfl2m.png)

## 客户端配置 

下载 windows 版本的 wireguard 双击安装后，启动应用并新建一个空隧道

![](/archives/wireguard/gvwao4.png)

在弹出的窗口中输入配置信息

![](/archives/wireguard/ka789l.png)

完整的配置信息如下

```conf
[Interface]
PrivateKey = eCs4w0......
Address = 192.168.0.2/24
DNS = 4.4.4.4

[Peer]
PublicKey = 37rZAF......
AllowedIPs = 192.168.0.0/24
Endpoint = xx.xx.xx.xx:22
PersistentKeepalive = 25
```
### Interface部分

这里的公私钥是自动生成的，并将这里生成的 “公钥” 是填入到前面服务端配置 Peer 的 PublicKey 项中

Address 填入的是本地的组网地址，这个地址也是和服务端配置中 Peer 的 AllowedIPs 相同的

### Peer部分

PublicKey 填入的是服务端的 server.key.pub 文件内容

AllowedIPs 表示允许哪些网段流量流经 wg0 虚拟网卡，可以配置多个项，以逗号分割

如果不需要限制流量，那么只需要填写和 ip 地址相同的网段即可，如 ip 地址为 192.168.0.2，那么网段就是 192.168.0.0

Endpoint 填入的是服务端的公网地址，以及端口号

### 启动客户端

配置好之后，点击界面上的 “连接”，连接成功后，界面显示如下类似信息

![](/archives/wireguard/kry0ez.png)

在本地 win10 测试服务端的 ping 情况，连接正常

![](/archives/wireguard/lj9wxz.png)
