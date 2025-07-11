---
categories:
- 默认分类
date: '2024-12-30T13:22:00'
description: ''
draft: false
image: ''
slug: securecrt-delay
tags:
- linux
title: ubuntu下ssh连接慢的问题分析
cover: /archives/securecrt-delay/image-algg.png
---

## 服务端配置修改

使用终端工具 SecureCRT 连接本地虚拟机 ubuntu ，发现连接超级慢，大约耗时 10 秒左右，实在无法忍受

网上搜到的一些信息看 /etc/ssh/sshd\_config 导致的 ，修改了两个配置，但是效果还是一样的慢，没有任何改善

```shell
UseDNS no
GSSAPIAuthentication no
```

使用 win 下的命令行窗口进行 ssh 连接，发现没有任何延时，换一个工具如 winterm 连接也没有任何延时

但是 SecureCRT 连接却延时 10s 左右，那么只能是 SecureCRT 中的配置导致的

## 修改 SecureCRT 配置

经过一番调研，发现 SecureCRT 下的 GSSAPI 配置导致的，需要将 Method 修改为 MS Kerberos 才行，其他的都不行

在连接的属性配置页中修改，完整的修改项如下：

![](/archives/securecrt-delay/image-algg.png)
