---
categories:
- 默认分类
date: '2025-03-29T10:04:15'
description: ''
draft: false
image: ''
slug: wordpress-cookie
tags:
- cookie
- wordpress
- HMAC
title: wordpress的cookie理解
---

## **登录 wordpress** 

登录 wordpress 的时候 Cookie 显示为 


PHPSESSID=ubilj5ad65810hqv88emitmvkc; isLogin=true; night=0; wordpress_logged_in_27e3261db108cd80480af5f900ac865e=1735846526%7C1744418831%7CrTugvME3l2ZITBoxf6JAsAn4woFdbIZvggvvKDRHQhc%7C3fa99b7f0728dffc47f75b2ff9fad46c63c2829a512e6a09c3bf3bde7cf48946; Hm_lvt_b9d1067bce8fcdeb644686f85bafea51=1743219234; Hm_lpvt_b9d1067bce8fcdeb644686f85bafea51=1743219234; HMACCOUNT=1BDCC2409CB6526C


关闭浏览器后重新打开页面 cookie 显示为


PHPSESSID=ubilj5ad65810hqv88emitmvkc; isLogin=true; wordpress_logged_in_27e3261db108cd80480af5f900ac865e=1735846526%7C1744418831%7CrTugvME3l2ZITBoxf6JAsAn4woFdbIZvggvvKDRHQhc%7C3fa99b7f0728dffc47f75b2ff9fad46c63c2829a512e6a09c3bf3bde7cf48946; Hm_lvt_b9d1067bce8fcdeb644686f85bafea51=1743219234


其中 `Hm_lvt_*`, `Hm_lpvt_*` 和 `HMACCOUNT` 是百度统计相关的（百度使用的），精简后有效的 cookie 内容为 


PHPSESSID=ubilj5ad65810hqv88emitmvkc; isLogin=true; wordpress_logged_in_27e3261db108cd80480af5f900ac865e=1735846526%7C1744418831%7CrTugvME3l2ZITBoxf6JAsAn4woFdbIZvggvvKDRHQhc%7C3fa99b7f0728dffc47f75b2ff9fad46c63c2829a512e6a09c3bf3bde7cf48946; 


## **Cookie 的解释**


wordpress_logged_in_27e3261db108cd80480af5f900ac865e


`27e3261db108cd80480af5f900ac865e`：这是一个 `MD5` 哈希值，基于 wordpress 安装的 `site_url()` 计算得出

#### **Cookie 值**


1735846526%7C1744418831%7CrTugvME3l2ZITBoxf6JAsAn4woFdbIZvggvvKDRHQhc%7C3fa99b7f0728dffc47f75b2ff9fad46c63c2829a512e6a09c3bf3bde7cf48946


其中 `%7C` 是 URL 编码的 `|`（竖线），用于分隔数据，URL 解码后是


1735846526|1744418831|rTugvME3l2ZITBoxf6JAsAn4woFdbIZvggvvKDRHQhc|3fa99b7f0728dffc47f75b2ff9fad46c63c2829a512e6a09c3bf3bde7cf48946


各部分含义如下：

1. `1735846526` 用户 ID 或用户名的 Hash

2. `1744418831` 过期时间的 UNIX 时间戳（即 `Date + 14` 天，若 “记住我” 未勾选，默认是 48 小时）

3. `rTugvME3l2ZITBoxf6JAsAn4woFdbIZvggvvKDRHQhc` 用户身份验证的 HMAC（Hash-based Message Authentication Code）

4. `3fa99b7f0728dffc47f75b2ff9fad46c63c2829a512e6a09c3bf3bde7cf48946` HMAC 校验码

其中 HMAC（Hash-based Message Authentication Code）是基于哈希的消息认证码，用于确保 Cookie 没有被篡改

计算规则如下

HMAC = HMAC-SHA1(AUTH_KEY . user_login . expiration_time . session_key, SECURE_AUTH_KEY)

这里的各字段解释如下

- AUTH_KEY 和 SECURE_AUTH_KEY：在 wp-config.php 中定义的安全密钥

- user_login：用户名

- expiration_time：Cookie 过期时间

- session_key：会话密钥，也就是上面的 `rTugvME3l2ZITBoxf6JAsAn4woFdbIZvggvvKDRHQhc` 这串

## **Cookie 校验流程**

当用户访问站点时：

1. WordPress 解析 Cookie 并提取用户信息

2. WordPress 计算应得的 HMAC 并与 Cookie 里的值比对，确保 Cookie 未被篡改

3. 若 HMAC 校验通过，则用户被视为已登录

