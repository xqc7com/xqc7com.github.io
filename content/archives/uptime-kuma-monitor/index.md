---
categories:
- 建站技能
date: '2025-01-16T15:32:00'
description: ''
draft: false
image: ''
slug: uptime-kuma-monitor
tags:
- Uptime Kuma
- 服务监控
title: 部署Uptime Kuma监控业务健康
cover: /archives/uptime-kuma-monitor/20250116145511192.png
---

Uptime Kuma 是参照 uptime robot 实现的开源监控工具，官网地址 https://github.com/louislam/uptime-kuma

支持使用多种方式来进行服务的监控，如 HTTP(s)、TCP、Ping、DNS、Push、gRPC... 等多种方式

常规使用 http(s) 主动请求的方式，来检查业务健康情况，可以部署在能访问到业务节点的内网中

![](/archives/uptime-kuma-monitor/20250116145511192.png)

## 监控部署

官方提供 docker 的安装方式，在 linux 下在新建路径，并切换到该路径下 

```shell
mkdir -p /root/docker/uptime_kuma
cd /root/docker/uptime_kuma
```

部署前需要准备好 docker 环境，运行以下 docker 命令，该命令会自动拉取 uptime_kuma 镜像并部署容器

```
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/root/docker/uptime_kuma --name uptime-kuma louislam/uptime-kuma:1
```

部署完毕后，服务监听在 3001 端口上，使用浏览器访问，如 http://192.168.10.120:3001/ ，然后创建管理员

![](/archives/uptime-kuma-monitor/20250116143743878.png)


## 监控配置

配置上比较简单，主要是添加监控项，每一个业务作为一个监控项，主要配置请求地址以及心跳间隔

![](/archives/uptime-kuma-monitor/20250116150215580.png)

然后就是添加一个或者多个状态页（相当于监控项分组），再将监控项添加到状态页上

比如这里添加的一个名为 “服务监控” 的状态页 status/monitor

![](/archives/uptime-kuma-monitor/20250116150452272.png)

另外一个支持通知送达，当业务故障的时候会触发通知事件，支持现有的大部分通知服务

如 Telegram、Discord、Email、Server酱... 等多种渠道的通知方式

![](/archives/uptime-kuma-monitor/20250116151208955.png)

![](/archives/uptime-kuma-monitor/20250116151340335.png)

配置完毕后，就可以放一边了，登录后台可以最多查看业务过去一周的健康情况

![](/archives/uptime-kuma-monitor/20250116150127353.png)



## 健康检查

配置完之后，就可以不需登录，在浏览器查看业务的健康情况了，如 http://192.168.10.120:3001/status/monitor

![](/archives/uptime-kuma-monitor/20250116144300015.png)

但是这个显示范围目前还不能够随时调整，右侧只能显示 40 多个监控点

如果 30s 检查一次健康，只能显示 20 分钟左右的健康情况，不过有人配置 10 分钟检查，这样就可以显示 7 个多小时的范围

从 github 透露的信息来看，这个问题已经有人提了好长时间了，一直没进行优化，只能暂时先这样显示

![](/archives/uptime-kuma-monitor/20250116144954171.png)
