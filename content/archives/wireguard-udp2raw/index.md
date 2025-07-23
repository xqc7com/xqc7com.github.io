---
categories:
- 默认分类
date: '2025-03-11T17:54:53'
description: ''
draft: false
image: ''
slug: wireguard-udp2raw
tags:
- wireguard
- udp2raw
title: wireguard搭配udp2raw部署内网
cover: /archives/wireguard-udp2raw/sashnv.png
---

## 前言

上一篇写了使用 wireguard 可以非常轻松的进行[组网部署](https://www.xqc7.com/archives/wireguard)，但是如果服务器厂商屏蔽了 udp 端口，那就没法了

针对 udp 被服务器厂商屏蔽的情况，需要使用一款 udp2raw 或 socat 类似的工具，来将 udp 打包成 tcp 进行通信

这里以 udp2raw 进行部署，版本下载地址 https://github.com/wangyu-/udp2raw/releases

![](/archives/wireguard-udp2raw/sashnv.png)

部署的时候本地 win10 以及 ubuntu 都需要部署 udp2raw，整体业务流程如下

![](/archives/wireguard-udp2raw/sodof2.png)


## 服务端部署

下载 udp2raw 版本，解压后就可以运行，使用以下命令启动服务

```shell
udp2raw -s -l 0.0.0.0:8000 -r 127.0.0.1:51820 --raw-mode faketcp -a
```

-s 表示服务器模式

-l 0.0.0.0:8000 表示监听本机 8000 tcp 端口

-r 127.0.0.1:51820 表示将数据转发到本地 wireguard 监听的 udp 端口 51820

--raw-mode faketcp 表示将 udp 打包成 tcp

-a 表示自动应答握手提高稳定性

## 客户端部署

win 版本解压后，使用以下命令运行

```shell
udp2raw_mp.exe -c -l 127.0.0.1:51820 -r xx.xx.xx.xx:8000 --raw-mode easyfaketcp
```

-c 客户端模式

-l 127.0.0.1:51820 本地监听端口

-r xx.xx.xx.xx:8000  连接服务器的 8000 tcp 端口

--raw-mode easyfaketcp 打包成 tcp，兼容性更好，但可能稍慢

另外，win10 下的 wireguard 的 Endpoint 配置要修改下，改成 127.0.0.1:51820，而不再是服务端的地址

![](/archives/wireguard-udp2raw/ssoc9f.png)

## 启动应用

在启动应用前，应该先配置好 wireguard 服务端以及客户端，可以参考上一篇文章的操作步骤

启动 ubuntu 下的 udp2raw 后，输出信息如下，表示监听 8000 端口成功

![](/archives/wireguard-udp2raw/sv47bd.png)


启动 win10 下的 udp2raw 后，输出的信息如下

```shell
D:\software\udp2raw>udp2raw_mp.exe -c -l 127.0.0.1:51820 -r xx.xx.xx.xx:8000 --raw-mode easyfaketcp
using system32/npcap/wpcap.dll
The Winsock 2.2 dll was found okay, _setmaxstdio() was set to 4000
[2025-03-11 17:46:30][INFO]argc=8 udp2raw_mp.exe -c -l 127.0.0.1:51820 -r xx.xx.xx.xx:8000 --raw-mode easyfaketcp
[2025-03-11 17:46:30][INFO]parsing address: 127.0.0.1:51820
[2025-03-11 17:46:30][INFO]its an ipv4 adress

......

[2025-03-11 17:46:31][INFO]breakloop() succeed after 1 attempt(s)
[2025-03-11 17:46:31][INFO]state changed from client_idle to client_tcp_handshake_dummy
[2025-03-11 17:46:32][INFO]state changed from client_tcp_dummy to client_handshake1
[2025-03-11 17:46:32][INFO](re)sent handshake1
[2025-03-11 17:46:32][INFO]changed state from to client_handshake1 to client_handshake2,my_id is b61dae5a,oppsite id is f3e6fa3f
[2025-03-11 17:46:32][INFO](re)sent handshake2
[2025-03-11 17:46:32][INFO]changed state from to client_handshake2 to client_ready
[2025-03-11 17:46:32][INFO]new packet from 127.0.0.1:61205,conv_id=53a2d4f2
```
启动 win10 下的 wireguard，可以看到已经连接上了， ping 服务节点也是可以正常通的

![](/archives/wireguard-udp2raw/sz48hb.png)

![](/archives/wireguard-udp2raw/szpp4t.png)
