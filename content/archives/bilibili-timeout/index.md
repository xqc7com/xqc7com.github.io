---
categories:
- 默认分类
date: '2025-07-04T10:49:24'
description: ''
draft: false
image: ''
slug: bilibili-timeout
tags:
- 其他
title: B站图片资源无法加载
cover: /archives/bilibili-timeout/t1s63f.png
---

访问 B 站出现大面积失败的情况，很多的 hdslb.com 资源显示连接超时，了解到这里 https://v2ex.com/t/666462

然后更新了域名的 host 配置，然后就可以正常访问了

![20250703175557](/archives/bilibili-timeout/t1s63f.png)

查看本地 dns 的配置，两个配置分别为 8.8.8.8 和 1.1.1.1，跟踪路由发现也是正常的

![20250704084253](/archives/bilibili-timeout/dy704b.png)

域名解析涉及到的有以下几个，如果还有其他失败的域名也得继续替换，直到全部正常为止

s1.hdslb.com

i0.hdslb.com

i2.hdslb.com

配置 host 时每个域名对应的 ip 地址，可以在站长之家中查看，如：https://ping.chinaz.com/s1.hdslb.com

从解析到的 ip 地址列表中选择其中一个进行替换即可

![20250704092043](/archives/bilibili-timeout/f8kqi8.png)

