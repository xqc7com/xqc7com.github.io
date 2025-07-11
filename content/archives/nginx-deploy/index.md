---
categories:
- 网站运维
date: '2024-12-29T09:44:00'
description: ''
draft: false
image: ''
slug: nginx-deploy
tags:
- nginx
title: nginx下多站点部署配置
---

多站点域名部署的情况下，如 aaa.com 和 bbb.com，每个域名下面又有多个子域名，都部署在同一台主机上

现在希望 nginx 能配置实现如下的逻辑：

1、禁止直接输入 ip 地址进行访问，包括 http 和 https

2、输入 http 访问的时候跳转到对 https 访问

3、对每个域名下不存在的子域名访问的时候，跳转到对应的主域名访问

## 禁止直接输入 ip 地址进行访问

为了实现禁止通过 ip 访问 https ，得配置一个 server 的 ssl 域，而 ssl 还需要提供对应的证书以及密钥，不然 nginx 会报错

这里可以不使用域名站点的证书和密钥，通过命令专门生成一个证书和密钥提供给禁止 ip 访问 443 的 server 域使用

生成命令如下

```shell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
```

配置禁止 ip 访问的 80 域和 443 域如下

```nginx
        server {
            listen 80 default_server;
            server_name _;
            location / {
                return 444;
            }
        }

        server {
            listen 443 ssl default_server;
            server_name _;

            ssl_certificate /root/nginx/cert/server.crt;
            ssl_certificate_key /root/nginx/cert/server.key;

            location / {
                return 444;
            }
        }
```

## 输入 http 访问跳转到 https 访问

这个配置相对简单一点，直接 301 转发就可以了，也可以使用 rewrite 指令，配置如下

```nginx
        server {
            listen 80;
            server_name aaa.com www.aaa.com bbb.com www.bbb.com;
            #return 301 https://$host$request_uri;
            rewrite ^(.*)$ https://$host$1 permanent;
        }
```

## 对不存在的子域名访问进行跳转

逻辑和前面差不多，不过需要指定 * 域名，和指定证书和密钥，配置如下

还有更多域名的话自行添加就可以

```nginx
        server {
            listen 443 ssl;
            server_name *.aaa.com aaa.com www.aaa.com;

            ssl_certificate /root/nginx/cert/cert1.pem;
            ssl_certificate_key /root/nginx/cert/cert1.key;

            location / {
                return 301 https://blog.aaa.com$request_uri;
            }
        }

        server {
            listen 443 ssl;
            server_name *.bbb.com bbb.com www.bbb.com;

            ssl_certificate /root/nginx/cert/cert2.pem;
            ssl_certificate_key /root/nginx/cert/cert2.key;

            location / {
                return 301 https://blog.bbb.com$request_uri;
            }
        }
```
