---
categories:
- 默认分类
date: '2025-02-07T11:46:28'
description: ''
draft: false
image: ''
slug: catch-python-https-packages
tags:
- wireshark
- https
- python
title: 使用wireshark抓取python发起的https请求包
cover: /archives/catch-python-https-packages/x5sfxw.png
---

## 前言

之前有调研过 wireshark 抓取 https 报文，核心就是 SSLKEYLOGFILE 配置

有从[客户端 chrome 发起抓包](https://www.xqc7.com/archives/catch-client-https-packages)的，有从[服务端 wordpress 发起抓包](https://www.xqc7.com/archives/catch-server-https-packages)的

我理解是不管什么语言发起的 https 请求，只要配置了 SSLKEYLOGFILE 就能正常抓取 

并且在 go 代码中通过添加 SSLKEYLOGFILE 配置，可以实现在 wireshark 抓取其发起的 https 请求报文

但是 python 对 https 却不是这样的，这里 python 代码使用的库是 requests

通过 chatgpt 的回复了解到，是 requests 底层的封装库就没有启用对 SSLKEYLOGFILE 的支持

![](/archives/catch-python-https-packages/x5sfxw.png)

## 抓包思路

既然尝试修改 python 代码配置 SSLKEYLOGFILE，目前是没办法抓取到其发起的 https 请求报文

那么可以通过 mitmproxy 部署一个代理，然后 python 通过 mitmproxy 代理，发起 https 请求 

再使用 wireshark 对 loopback 网卡进行抓包，就能正常抓到 https 报文了


## 安装mitmproxy

安装包可以从 [官方地址](https://downloads.mitmproxy.org/11.1.2/mitmproxy-11.1.2-windows-x86_64-installer.exe) 进行下载，下载后双击安装就可以了，安装后启动界面如下

默认是监听本地的 8080 端口

![](/archives/catch-python-https-packages/fswg8l.png)

## wireshark抓包

启动 wireshark 软件，在启动页面选择 lookback 网卡进行抓包

![](/archives/catch-python-https-packages/fuhi2b.png)

## python发起请求

python 代码中发起请求的时候，设置本地代理

```python
import requests

proxies = {
    'http': 'http://127.0.0.1:8080',
    'https': 'http://127.0.0.1:8080'
}
response = requests.get('https://www.google.com', proxies=proxies, verify=False)
print(response.status_code)
```

本地运行 python 的请求代码，从 mitmproxy 软件上就可以看到有请求记录了

![](/archives/catch-python-https-packages/gpgic9.png)

在这里 mitmproxy 扮演的是中间人的角色，在本地运行时会启动一个 HTTP 代理服务器

在 wireshark 中使用 http 进行过滤，就可以看到 python 发起的 https 请求包了

![](/archives/catch-python-https-packages/hgax8o.png)
