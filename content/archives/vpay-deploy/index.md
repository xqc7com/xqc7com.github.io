---
categories:
- 建站技能
date: '2025-02-11T19:22:25'
description: ''
draft: false
image: ''
slug: vpay-deploy
tags:
- vmq
- vmqApk
- 支付系统
title: vmq开源支付系统部署
cover: /archives/vpay-deploy/uc4r45.png
---

## 前言

vmq 是一套开源版的支付系统，可以进行免签支付，并提供了客户端以及服务端的部署版本

官方发布有 java 和 php 的服务端版本，两个版本基本一致，vmqApk 是安卓版本客户端，官方地址 

```
https://github.com/szvone/Vmq
https://github.com/szvone/vmqphp  
https://github.com/szvone/vmqApk
```

## 支付原理

通常只能是商家才能接入支付业务，如果个人要接入支付业务，通常有以下几种方式 

1、通过第三方如虎皮椒这种平台

但是这种支付有一定限制，比如说存在域名限制不能变更，另外还有开户手续费，以及每笔订单抽成

而且大量这种野生的支付平台，一旦选择不慎，平台随时都存在跑路的可能，比如之前和虎皮椒齐名的 [PAYJS 已经跑路](https://v2ex.com/t/878369)

![](/archives/vpay-deploy/uc4r45.png)

2、个人搭建免签系统

微信对个人不支持免签，支付宝可以进行面对面支付，个人也能开通，不过异地支付也有可能被随时中止

这里支付的本质问题就是，对个人用户，微信/支付宝是否有提供支付回调，对商户而言是有支付回调的

如果微信/支付宝不提供回调，那么在你的产品被客户付款之后，你的平台是无法感知到的

所以出现了免签系统，免签系统用的比较多的就是 v 免签，也有一些套壳 v 免签的如某鲸支付

**它的原理就是：**

部署一个 java 的 vmq 或者 php 版本的服务端 ，以及一个安卓客户端 vmqApk

安卓客户端手机上运行着微信/支付宝，并且监听着通知栏消息，打开手机的微信/支付宝的通知消息

在接收到消息的时候，显示在通知栏上（因为权限问题，这里是没有 iphone 版本客户端的）

VmqApk 在监控到微信/支付宝通知消息之后，通过解读通知消息，如果发现是支付信息

那么就会向 Vmq 服务端发送支付响应，表示当前已经收到支付信息 XX 元 

但是这一类免签系统都存在着天然的缺陷，就是无法处理并发订单的问题

所以 Vmq 在处理这个问题上，限制订单在有效期内一个金额数值只能有一笔订单

相同金额的订单会进行 1 分钱的递增/递减以便区分

![](/archives/vpay-deploy/vhm56d.png)



## JAVA服务端部署

官方提供的编译版本，默认监听在 8080 端口，可以启动时指定监听端口

数据存储使用 h2 本地数据库文件，windows下默认在 C:\Users\Administrator\mq.mv.db

linux 下默认在 home 目录下文件名为 mq.mv.db ，也可以通过启动命令指定文件

```
java -jar vmq.war --server.port=9090 --spring.datasource.url="jdbc:h2:/root/v/mq"
```

启动成功后，终端窗口会有提示信息，没问题的话会正常监听，比如我这里监听在 8003 端口

![](/archives/vpay-deploy/20250109171650632.png)

登录首页，默认账户密码为 admin/admin，登录后候建议修改密码

## PHP服务端部署

下载 vmqphp 代码后，新增一个 web 站点，根目录指向 vmqphp/public 目录

登录 mysql 使用命令创建数据库 `CREATE DATABASE vmq character set utf8mb4;` 并使用代码目录下的 vmq.sql 文件创建数据表

浏览器访问站点地址，如果提示下面的错误，那么调整下 index 的顺序

![](/archives/vpay-deploy/o2jfzc.png)

将 index.html 调整在 index.php 的前面，再次刷新浏览器就可以显示登录页面了

![](/archives/vpay-deploy/o4cqz8.png)

在登录页面输入 admin/admin 后点击登录，没有进行登录跳转，开发者工具下查看显示如下

这是因为本地 php 使用的是 7.4 的版本，不再支持数组大括号 {} 的写法

打开 thinkphp\library\think\db\Query.php 文件，定位到 568 行，将大括号 {} 修改为中括号 [] 就可以了

![](/archives/vpay-deploy/phndmy.png)

## 客户端部署

电脑端运行浏览器访问服务端的 web 页面，在设置页面进行收款二维码的配置

将 apk 安装包拷贝到安卓手机上安装，并使用扫码配置，进行配对初始化

从 github 仓库的代码来看，默认只支持 http 明文的请求，对于 https 的请求是无法配置成功的

如果 vmq 服务端的域名配置了证书的话，有两种处理方式

1、一种方式是开放 http 访问，使得服务同时支持 https 和 http 请求

2、一种方式是修改官方 Apk 版本的代码，支持 https 请求访问

![](/archives/vpay-deploy/20250109173729233.png)

改动也很简单，把代码中 http 改成 https ，修改后重新编译安装，然后扫描服务端进行配置就可以了

改了之后，就不支持 http 了，如果还需要支持 http，那么这里的代码就需要做适配兼容了




