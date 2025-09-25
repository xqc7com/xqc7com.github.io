---
categories:
- 默认分类
date: '2025-09-25 15:49:24+08:00'
description: ''
draft: false
image: ''
slug: office2013-active
cover: /archives/office2013-active/6s98zv.png
tags:
- office
title: 使用KMS进行office2013激活
---
​
可以使用网上提供的 KMS 服务进行激活，比如这里 https://www.kms.pub/index.html

进入 office2013 的安装目录，默认安装在这里 `cd "C:\Program Files\Microsoft Office\Office15"`

安装 office2013 激活密钥 `cscript ospp.vbs /inpkey:YC7DK-G2NP3-2QQC3-J6H88-GVGXT`

![](/archives/office2013-active/qg1l39.png)

密钥安装成功后，分别执行下面的命令，分别是：设置 KMS 服务器，激活 office2013，查看 office2013 激活状态

```
cscript ospp.vbs /sethst:kms.03k.org
cscript ospp.vbs /act
cscript ospp.vbs /dstatus
```

![](/archives/office2013-active/56temd.png)

在激活的时候，提示已经被 blocked 掉了，但是后面又提示 `Product activation successful`，有点迷糊

![](/archives/office2013-active/6s98zv.png)

查看激活状态的时候提示 `REMAINING GRACE: 180 days  (259200 minute(s) before expiring)` 看样子是有点问题的

![](/archives/office2013-active/0whh46.png)

在激活后打开 excel，发现之前 excel 顶部那个醒目的红色未注册提示，已经没有显示了，看来还是有点效果的

但是查看账户中的产品信息，似乎激活效果和我想的不太一样，但至少红色的未注册提示条已经没有了，也可能激活的是 180 天内不再提示未注册信息？

![](/archives/office2013-active/u9xkee.png)

也可以尝试使用其他的 KMS 地址进行激活，如下面的地址

如果需要自己搭建 KMS 服务的话可以参考这里的开源实现 https://github.com/Wind4/vlmcsd

```
kms.03k.org
kms.chinancce.com
kms.luody.info
kms.lotro.cc
kms.luochenzhimu.com
kms8.MSGuides.com
kms9.MSGuides.com
```



​