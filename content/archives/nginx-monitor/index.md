---
categories:
- 网站运维
date: '2025-08-24 17:37:24+08:00'
description: ''
draft: false
image: ''
slug: nginx-monitor
cover: /archives/nginx-monitor/l5eytz.png
tags:
- nginx
- goaccess
title: nginx部署goaccess监控
---

## 前言

要在 nginx 中增加 流量访问的统计功能，可以通过以下几种方式实现：

1、通过分析 nignx 的日志

2、使用 ningx 的模块，如 ngx_http_stub_status_module 以及第三方的 nginx 组件

3、使用第三方监控，如Grafana + Prometheus、ELK Stack、Zabbix 等

其中组件 ngx_http_stub_status_module 提供的监控信息比较基础，如果需要更详细的监控需要引入其他的组件，在部署上相对麻烦

第三方的监控方式，是比较成熟的商业解决方案，但是部署上比较麻烦，通常用于企业部署，个人部署倾向使用 goaccess 来分析 nginx 日志进行监控

## 部署

goaccess 是轻量级的开源解决方案，官方地址 https://goaccess.io/，使用简单，本地安装后，通过配置一条 crontab 命令，定期分析 nginx 日志并生成 html 页面

在 nginx 中配置一条 location，指向 goaccess 生成的 html 文件即可，重启 nginx 即可在 web 端进行查看监控情况

### 安装goaccess

ubuntu 下使用 apt 安装 goaccess，goaccess 也提供了 docker 的发行版本

```shell
sudo apt update
sudo apt install goaccess -y
```

### 生成监控页面

增加一个监控的站点目录，如 `/var/www/html/monitor`，然后添加一个 crontab 命令如下

```shell
*/5 * * * * /usr/bin/goaccess /var/log/nginx/access.log -o /var/www/html/monitor/index.html --log-format=COMBINED
```

该命令每 5 分钟执行一次，读取 nginx 的日志文件 `/var/log/nginx/access.log`，分析生成 `/var/www/html/monitor/index.html` 页面

日志的格式使用 COMBINED ，一个典型的 COMBINED 日志格式如下 

```shell
127.0.0.1 - - [24/Aug/2025:12:34:56 +0800] "GET /index.html HTTP/1.1" 200 1024 "https://example.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
```

如果使用了自定义的日志格式，需要告诉 goaccess，不然会出现解析错误的情况，如自定义日志的格式如下

```
log_format main '$time_local client[$remote_addr] cf[$realip_remote_addr] - $scheme - request[$request] '
    '$status send[$body_bytes_sent] host[$host] refer[$http_referer] useragent[$http_user_agent]';
```

那么 goaccess 的日志格式应该指定为如下

```shell
/usr/bin/goaccess /var/log/nginx/access.log -o /var/www/html/monitor/index.html \
  --log-format='%d:%t %^ client[%h] cf[%^] - %^ - request[%r] %s send[%b] host[%v] refer[%R] useragent[%u]' \
  --date-format='%d/%b/%Y' \
  --time-format='%H:%M:%S'
```

### 配置nginx

使用 goaccess 生成的监控页面，需要在 nginx 配置 location，以方便在浏览器上查看监控，这里使用了 base auth 授权

```shell
location ^~ /monitor/ {
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    root /var/www/html/;
    index index.html;
}
```

通过以下命令创建授权用户访问，运行命令后输入密码，在查看监控的时候需要授权才能访问

这里的 -c 表示创建一个 /etc/nginx/.htpasswd 文件，记录输入的用户密码信息

```shell
htpasswd -c /etc/nginx/.htpasswd admin
```

配置完毕后，重新加载 nginx 配置后生效 `nginx -s reload`

## 查看监控

在浏览器中输入需要访问的域名，输入账号密码，查看部分效果如下（清空了日志，目前还没有任何日志）

![](/archives/nginx-monitor/l5eytz.png)






