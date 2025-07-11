---
categories:
- 默认分类
date: '2025-02-14T20:14:30'
description: ''
draft: false
image: ''
slug: beyondcompare-sftp-ubuntu
tags:
- sftp
- beyond compare
title: beyond compare通过sftp远程对比文件
cover: /archives/beyondcompare-sftp-ubuntu/re6yy0.png
---

## 对比方式

beyond compare 支持远程文件夹的对比，非常方便，远程对比有几种方式

1、服务端开启 ftp 的方式

服务端开启 ftp 服务，新增 21 端口的监听，beyond compare 通过 ftp 连接到服务端，ftp 是基于明文传输的，因此不是很安全

还有一个升级版本 ftps，即在 ftp 的基础上，通过 SSL/TLS 加密来保护 FTP 通信的协议，相对安全一些

2、使用 sftp 的方式

服务端复用了 ssh 的端口，没有额外开放端口，使用 sftp 的方式可以通过密码连接，也可以通过配置免密连接

**免密连接**

配置免密连接比密码登录相对安全很多，免密操作和之前提到的是一样的，可以参考 [这里](https://blog.qc7.org/archives/login-ssh-without-password)

本地环境生成公私钥，将公钥配置到 ubuntu 中，经过测试，本地可以通过 ssh 免密连接到 ubuntu

本地测试 ssh 的连接命令 

```shell
ssh -v -i ~/.ssh/id_rsa root@xx.xx.xx.xx  
```

在这里需要将 `/etc/ssh/sshd_config` 的 PubkeyAuthentication 配置设置为 yes ，然后重启生效 

## 配置 beyond compare 

在 beyond compare 的 “工具” -> “配置档” 中，添加 sftp 的配置（复用 ssh 的端口，不用开启新的 ftp 端口）

配置指定私钥文件为前面生成经过验证的私钥

![](/archives/beyondcompare-sftp-ubuntu/re6yy0.png)

但是在连接的时候依旧提示要输入密码（没有更多的认证方式可用）

![](/archives/beyondcompare-sftp-ubuntu/qz35xd.png)

## ssh服务端日志

在 `/etc/ssh/sshd_config` 增加日志级别 `LogLevel DEBUG3` ，重启生效 `systemctl restart ssh`

再次通过 beyond compare 尝试 sftp 连接 ubuntu，查看服务端打印日志如下

这里看到从 method 从 none 直接走到了 password 认证，直接跳过了 publickey 的认证方式

![](/archives/beyondcompare-sftp-ubuntu/s9j45e.png)

正常流程应该是有 publickey 的环节，失败了才可能走到 password 认证

![](/archives/beyondcompare-sftp-ubuntu/sax660.png)

## 格式转换

经过了解，问题就出在私钥的格式上，windows下的私钥是通过 cygwin 下的 ssh-keygen 命令生成的

生成的私钥格式是基于 OpenSSH 格式的，而 beyond compare 要求的应该是传统 PEM 格式

初始生成的私钥格式文件开始有 OPENSSH 字样

![](/archives/beyondcompare-sftp-ubuntu/si2swx.png)

使用命令 `ssh-keygen -p -m PEM -f ~/.ssh/id_rsa ` 将前面的私钥转换为 PEM 格式

![](/archives/beyondcompare-sftp-ubuntu/sf134b.png)

转换后的私钥文件的前面显示为 RSA 字样

![](/archives/beyondcompare-sftp-ubuntu/sikwe1.png)

另外 ubuntu 上的 `/etc/ssh/sshd_config` 配置还需要增加接受 RSA 的格式验证，重启 ssh 使配置生效

```shell
PubkeyAcceptedAlgorithms +ssh-rsa
```

使用转换后格式的私钥，beyond compare 就可以通过 sftp 连接 ubuntu 了 

也可以在生成公私钥的时候，通过增加 -m 参数，来实现一步直接生成 PEM 格式的密钥，这样就不需要进行转换了 

```shell
ssh-keygen -t rsa -P '' -m PEM
```

## 回车换行

对比文件之后，很重要的一个操作就是对文件进行复制同步

在 linux/windows 跨系统的时候，回车换行是一个绕不开的话题，在 beyond compare 中默认会自动转换

大部分情况下这不会有问题，但是自动转换会导致文件的 md5 发生变化，有时候需要禁止转换

在 beyond compare 的配置页面上，选择 “传输”，勾选 “二进制” 禁止转换

![](/archives/beyondcompare-sftp-ubuntu/pgftyv.png)


