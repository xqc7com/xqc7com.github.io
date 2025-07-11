---
categories:
- 建站技能
date: '2025-02-21T12:26:46'
description: ''
draft: false
image: ''
slug: cf-tunnel
tags:
- tunnel
- cloudflare
title: cloudflare内网穿透到本地
cover: /archives/cf-tunnel/haz9vs.png
---

## ZeroTrust创建

登录 cf 官网，在左侧菜单中选择 “Zero Trust” 

![](/archives/cf-tunnel/haz9vs.png)

输入团队名称，团队名称在后续也是可以更改的

![](/archives/cf-tunnel/hek4le.png)

选择免费的套餐

![](/archives/cf-tunnel/hfuwuj.png)

进入付款页面，这里不付款也是可以使用的，这里直接忽略

![](/archives/cf-tunnel/hg9k97.png)

## Tunnels创建

回到 dash.cloudflare.com 页面，然后点击左侧的菜单  “Zero Trust” 进入配置页面

在 “Zero Trust” 页面，选择 “网络” 下的 “Tunnels”，然后在右侧中选择 “添加隧道”

![](/archives/cf-tunnel/idlu18.png)

在 “添加隧道” 选择 Cloudflared

![](/archives/cf-tunnel/ieze63.png)

输入隧道名称，点击 “保存隧道”

![](/archives/cf-tunnel/ig016h.png)

## 本地配置

在接下来的配置页面，根据自己的情况选择不同的部署环境

比如，我需要配置本地穿透的机器为 windows 64-bit，选择不同的环境，下方就会出现不同的配置信息


![](/archives/cf-tunnel/isd3cd.png)


依据配置中显示的操作，先下载安装包安装

```shell
https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi
```

安装完毕后，再运行命令进行服务安装（如果要卸载服务，运行命令 `cloudflared service uninstall`）
```shell
cloudflared.exe service install eyJhIjo...
```

运行命令后显示，` Agent service for cloudflared installed successfully` 表示隧道建立成功

![](/archives/cf-tunnel/iyltqm.png)

本地使用 phpstudy 部署一个 web 站点，配置监听 8000 端口

![](/archives/cf-tunnel/j4x6s7.png)

并在站点目录下增加一个 index.php 文件，用于测试隧道，使用本地地址测试正常

```php
<?php 
echo "hello from cloudflare!";
```

回到 cf 的页面配置中来，点击下一步进入域名配置 

![](/archives/cf-tunnel/j23c06.png)

在域中，选择一个配置的域名，不清楚域名配置的可以参考 [这里](https://blog.qc7.org/archives/cloudflare-domain-hosting)

URL 指定为前面 phpstudy 部署的本地 web 服务，然后点击 “保存隧道”

![](/archives/cf-tunnel/jwc3jr.png)

保存后，显示的隧道页面中，出现一条状态正常的隧道记录

![](/archives/cf-tunnel/jz876l.png)

## 隧道测试

浏览器中输入地址进行访问，正常输出

![](/archives/cf-tunnel/k0fb0f.png)

## 单节点多隧道

在本地的节点上部署两套服务 test-001,test-002，端口分别是 8001 和 8002

![](/archives/cf-tunnel/ndyyli.png)

修改 cf 中前面  test-001 隧道的配置，并在 “公共主机名” 中最终为隧道创建了两条记录

test1 域名指向本地的 8001 服务，test2 域名指向本地的 8002 服务；经测试，两条隧道都能正确运行

![](/archives/cf-tunnel/ni7q4l.png)

## ubuntu部署

官网并没有 ubuntu 的选项，这里使用的是 debian 平台的包，下载安装包并进行安装

```shell
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

dpkg -i cloudflared-linux-amd64.deb

cloudflared service install eyJhIjoiM...
```

安装服务后，cloudflared 服务会自动运行，`systemctl status cloudflared` 查看服务状态

![](/archives/cf-tunnel/o4u9lv.png)

ubuntu 下的 cloudflared 服务启动后，接着就是在 cf 中配置隧道了，这和前面的操作是一样的

## 重定向配置

cloudflare 中支持进行重定向配置，在 “批量重定向” 添加重定向规则以及重定向列表

![](/archives/cf-tunnel/vorgfe.png)

重定向列表指定规则，根域名以及 www 域名重定向到 blog 域名

![](/archives/cf-tunnel/vq6zkd.png)

回到域名 DNS 配置页面，添加两条 DNS 记录，我这里的配置指向了任意一个 cf 的地址

![](/archives/cf-tunnel/vrakkf.png)

稍等片刻待 DNS 记录生效后，访问 qc7.org 或者 www.qc7.org，就会跳转到 blog.qc7.org 访问了


![](/archives/cf-tunnel/vsmy1l.png)
