---
categories:
- 建站技能
date: '2025-01-09T14:33:00'
description: ''
draft: false
image: ''
slug: cloudflare-domain-hosting
tags:
- cloudflare
- 域名管理
title: 使用cloudflare托管域名
cover: /archives/cloudflare-domain-hosting/20250109121125979.png
---

cloudflare 有很多功能，可以在 cf 中可以进行域名托管，证书管理，WAF 等

这里来实操一下怎么通过 cf 来托管个人域名，以及邮件和证书的配置

## 域名添加

登录 cf 后，在首页的右侧位置，有一个 “添加域” 按钮，点击然后输入你自己的域名

![](/archives/cloudflare-domain-hosting/20250109121125979.png)

然后为自己的选择一个计划，这里选择免费的就行

![](/archives/cloudflare-domain-hosting/20250109121146591.png)

添加域名后，会出现一个页面，提示 “更改您的名称服务器”

这里会出现两条 cf 的名称服务器地址，一会要在域名服务提供商中配置

![](/archives/cloudflare-domain-hosting/20250109121246494.png)

这里以托管阿里云的域名为例，其他域名提供商注册的域名也是一样的

登录阿里云，选择需要修改的域名，在 “DNS修改” 页面中，将上面两条 cf 的地址添加到这里来

![](/archives/cloudflare-domain-hosting/20250109121344924.png)

![](/archives/cloudflare-domain-hosting/20250109121423971.png)

阿里云中的 DNS 服务器修改后，回到 cf 中来

但是修改不会马上生效，有一个生效时间，当看到绿勾的时候表示已经生效了

![](/archives/cloudflare-domain-hosting/20250109121910104.png)

生效后就可以在左侧的 “DNS” 中添加个人的主机解析记录了

这个 DNS 的添加配置，和在阿里云上的配置没什么区别

## 邮件配置

cf 中可以配置接收所有以你域名为地址的邮件，并转发到指定邮箱

比如，你的域名是 abc.com，那么无论是发往 admin@abc.com

还是 xxx@abc.com 或者你域名的其他任意地址，都可以给你接收送达

但是有一个， cf 不提供发信的功能，如果需要回信得自行解决

在 “电子邮件路由” 中，“路由规则” 标签页，创建你指定的邮件地址，如 admin 等

并指标目标邮件地址，以便 cf 将邮件转发到你有效的邮箱中

上面的 Catch-all 可以一起配置上，表示其他没添加的地址也一并转发

![](/archives/cloudflare-domain-hosting/20250109124112666.png)

比如，你的域名为 abc.com

配置了 admin@abc.com 地址，转发到 hello@gmail.com 进行接收

并且配置了 Catch-all 的接收地址为 world@gmail.com

当有人发送邮件给 bob@abc.com 时，邮件将会转发给 world@gmail.com

## 证书配置

在 cf 的页面中，选择 “SSL/TLS”，然后点击右边的 “配置”

![](/archives/cloudflare-domain-hosting/20250109132150500.png)

在该配置页面中，有两种配置方式：自动配置，以及自定义配置

这里选择自定义配置中的 “完全（严格）” 模式，右侧可以看到它的提示图

![](/archives/cloudflare-domain-hosting/20250109132415005.png)

选择模式后，点击保存

选择 “源服务器” 菜单点击，右侧点击 “创建证书”

![](/archives/cloudflare-domain-hosting/20250109132843796.png)

在源证书安装页面，保持默认的配置就行，这里生成的是通配证书，有效期为15年长的证书

![](/archives/cloudflare-domain-hosting/20250109133302984.png)

点击创建后，生成了一个源证书和私钥，这里将它们复制下来，然后点击确定

![](/archives/cloudflare-domain-hosting/20250109133551608.png)

登录个人的 nginx 服务器，创建两个文件，内容分别为上面的源证书和私钥

假如保存证书的路径如下

源证书 /root/nginx/cert/cert.pem   
私钥 /root/nginx/cert/cert.key

在 nginx.conf 增加如下配置，并重启 nginx 生效

```
        server {
            listen 80;
            server_name abc.com www.abc.com;
            location / {
                add_header Content-Type text/plain;
                return 200 'Hello World!';
            }
        }

        server {
            listen 443 ssl;
            server_name abc.com www.abc.com;

            ssl_certificate /root/nginx/cert/cert.pem;
            ssl_certificate_key /root/nginx/cert/cert.key;

            location / {
                add_header Content-Type text/plain;
                return 200 'Hello World!';
            }
        }

```

nginx重启生效后，使用浏览器访问域名地址，就可以看到正常的显示效果了



