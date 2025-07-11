---
categories:
- 默认分类
date: '2025-04-30T14:02:55'
description: ''
draft: false
image: ''
slug: bitwarden_saveconfig
tags:
- bitwarden
title: 在bitwarden插件保存登录的问题
cover: /archives/bitwarden_saveconfig/izp7um.png
---

bitwarden 是一款开源的密码管理工具，可以使用官方提供的付费密码托管服务，也可以自行部署进行使用，并且配备了 chrome 插件

这里在本地使用容器的方式进行部署，部署也不复杂，基于自签证书的方式进行访问，web 访问的时候会提示“连接不安全”

通常情况下，点击高级下的继续就可以忽视这个警告，不影响正常使用

![image-20250430114831323](/archives/bitwarden_saveconfig/izp7um.png)



在 chrome 浏览器的插件中，也是可以正常使用的，但是当需要新增登录项的时候就出现问题了，保存的时候提示错误如下

![image-20250430114225453](/archives/bitwarden_saveconfig/iw3n5h.png)

查看 chrome 插件的网络请求，保存的时候提示错误如下（net::ERR_CERT_AUTHRITY_INVALID），这是因为自签证书没被信任的原因导致的

![image-20250430120602857](/archives/bitwarden_saveconfig/jy2jkw.png)



web 页面是可以正常新增的，不过使用上会比较麻烦，远没有插件使用来的方便，这里需要对自签证书进行添加信任

在 powershell 中将前面对 bitwarden 服务签发的证书进行查看，如果显示是没有 ip 的话需要重新进行签发

`Import-Certificate -FilePath "F:\downloads\server.crt" -CertStoreLocation Cert:\LocalMachine\Root`

使用配置进行签发，将下面配置保存为 san.cnf

```ini
[req]
default_bits       = 2048
prompt             = no
default_md         = sha256
distinguished_name = req_distinguished_name
req_extensions     = req_ext

[req_distinguished_name]
CN = 192.168.10.240

[req_ext]
subjectAltName = @alt_names
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
IP.1 = 192.168.10.240
```

然后通过 openssl 命令，使用 san.cnf 配置进行签发生成 server.key 和 server.crt 文件

`openssl req -x509 -nodes -days 825 -newkey rsa:2048 -keyout server.key -out server.crt -config san.cnf -extensions req_ext`

再次查看证书显示 ip 地址 CN=192.168.10.240（下面第一个是不合规的证书，第二个是合规的证书）

![image-20250430120100404](/archives/bitwarden_saveconfig/jv2lc9.png)

替换 bitwarden 的证书文件，然后重启 bitwarden 的容器服务

这里还需要将自签的证书安装到 win 本地，也就是 server.crt 文件，双击该文件（或者右键选择安装证书），在弹出的窗口中点击 “安装证书”

![image-20250430122219960](/archives/bitwarden_saveconfig/k87m44.png)

存储位置选择 “本地计算机”

![image-20250430122332374](/archives/bitwarden_saveconfig/k8cy6w.png)

证书路径选择 “受信任的根证书颁发机构”，然后确定完成，显示证书已导入

![image-20250430122540697](/archives/bitwarden_saveconfig/k9lp9q.png)



重启 chrome 浏览器，访问本地部署的 bitwarden 地址，没有出现证书告警的问题

![image-20250430134213146](/archives/bitwarden_saveconfig/m73ef4.png)

再次对 bitwarden 新增记录保存，显示项目已添加

![image-20250430134626430](/archives/bitwarden_saveconfig/m9khxi.png)
