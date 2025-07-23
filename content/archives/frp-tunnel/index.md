---
categories:
- 建站技能
date: '2025-02-21T16:27:10'
description: ''
draft: false
image: ''
slug: frp-tunnel
tags:
- tunnel
- frp
title: frp内网穿透到本地
---

官方开源地址 https://github.com/fatedier/frp 

下载的版本包中包含了服务端 frps 和客户端 frpc 执行文件，旧版本可以查看所有配置 frpc_full.ini 和 frps_full.ini

## 服务端配置 

默认只需要 bind_port 就可以了，下面开启了 dashboard 的配置，可以以 web 方式查看 frp 的穿透状态

使用 tls 进行访问，生成证书和私钥可以查看 [这里](https://www.xqc7.com/archives/ubuntu-deploy) 的 “配置ssl” 

```conf
[common]
log_file = ./logs/frps.log
log_level = debug
log_max_days = 30

bind_port = 7000
#vhost_http_port = 8000

dashboard_user = admin
dashboard_pwd = 123456
dashboard_port = 8080

dashboard_tls_mode = true
dashboard_tls_cert_file = /root/frp/cert/certificate.crt
dashboard_tls_key_file = /root/frp/cert/private.key

```

## 客户端配置

客户端指定 server_addr ，每一节指定一个本地服务，如 tools、imgs

```conf
[common]
server_addr = xx.xx.xx.xx
server_port = 7000

log_file = ./logs/frpc.log
log_level = debug
log_max_days = 30

[tools]
type = tcp
local_ip = 127.0.0.1
local_port = 8001
remote_port = 8001

[imgs]
type = tcp
local_ip = 127.0.0.1
local_port = 8002
remote_port = 8002
```

## nginx转发

nginx 的配置如下，nginx 接收到 www.abc.com 域名的请求后，转发给 frp 的 8001 端口

```nginx
server {
        listen 443 ssl;
        server_name www.abc.com;

        ssl_certificate /root/nginx/cert/abc.pem;
        ssl_certificate_key /root/nginx/cert/abc.key;

        location / {
                proxy_pass http://localhost:8001/;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                add_header Content-Security-Policy upgrade-insecure-requests;
        }
}
```
