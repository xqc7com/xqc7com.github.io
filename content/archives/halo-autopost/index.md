---
categories:
- 建站技能
date: '2025-01-23T18:27:09'
description: ''
draft: false
image: ''
slug: halo-autopost
tags:
- halo
- vscode
- markdown
- 自动发文
title: 基于halo使用vscode插件自动发布文章
cover: /archives/halo-autopost/gtu9mt.png
---

## 前言

最近断断续续写了一些水文，算是自己一路折腾的一些记录，也方便自己后面的查阅

最开始是发布在csdn上，后来增加发布到zhihu，以及juejin上，最近考虑整合到 halo 的发布

## 搭建halo系统

halo是一款好看强大的内容管理系统，并且有着丰富的三方插件，基于java开发，提供多种部署方式

这里使用 jar 方式进行部署，登录云主机，进行 jar 包下载

```
wget https://github.com/halo-dev/halo/releases/download/v2.20.9/halo-2.20.9.jar -O halo.jar
```

![](/archives/halo-autopost/gtu9mt.png)

hale 支持多种数据库存储，这里使用 mysql 进行存储，它的系统只有一张表 extensions

在 /root 路径下创建 halo 目录，并添加 application.yaml 文件内容如下

```yaml
server:
  # 运行端口
  port: 9001
spring:
  # 数据库配置，支持 MySQL、MariaDB、PostgreSQL、H2 Database，具体配置方式可以参考下面的数据库配置
  r2dbc:
    url: r2dbc:pool:mysql://localhost:3306/halo
    username: root
    password: password
  sql:
    init:
      mode: always
      # 需要配合 r2dbc 的配置进行改动
      platform: mysql
halo:
  caches:
    page:
      # 是否禁用页面缓存
      disabled: true
  # 工作目录位置
  work-dir: /root/halo
  # 外部访问地址
  external-url: http://localhost:9001
  # 附件映射配置，通常用于迁移场景
  attachment:
    resource-mappings:
      - pathPattern: /upload/**
        locations:
          - migrate-from-1.x
```

登录本地 mysql 创建数据库，创建数据库 halo

```
create database halo character set utf8mb4 collate utf8mb4_bin;
```

以上步骤执行之后，就可以启动 halo 了，先进入到 halo 目录，执行启动命令

如果需要更详细日志加上 --debug 参数启动

```
java -Dfile.encoding=UTF-8 -jar halo-2.20.9.jar --spring.config.additional-location=optional:file:/root/halo/
```

启动成功后，在浏览器中输入地址访问，并进行账户初始化，结束后进入主页看到如下

这里默认的主题是 theme-earth，可以看到有些单调

![](/archives/halo-autopost/gwhy37.png)

可以安装市场提供的另一个主题 Joe3，地址 https://www.halo.run/store/apps/app-ZxiPb

在 halo 中通过应用商店进行安装，或者通过下载到本地，然后上传主题安装都可以

安装完后，在主题配置中启用刚安装的 “Joe3” 主题

![](/archives/halo-autopost/gygrme.png)

启用主题后的整体效果如下

![](/archives/halo-autopost/gyvciu.png)

## 插件发布文章

halo 的后台发文其实很 nice，但是多平台发布文章的话，通常得使用 markdown 进行本地编写

官方有提供 vscode 的发文插件 https://github.com/halo-sigs/vscode-extension-halo 

### 插件安装

在 vscode 的插件中心，直接搜索 halo ，进行插件安装 

在 win10 下，插件安装后磁盘目录在 C:\Users\Administrator\.vscode\extensions\ 下

![](/archives/halo-autopost/h8o06j.png)


### 生成令牌

在后台的个人配置中增加个人令牌，并进行文章管理授权

点击提交后，生成一个 token，将 token 复制下来，一会需要在 vscode 中进行配置

![](/archives/halo-autopost/ha8yl6.png)

### 插件配置

打开 vscode ，按 `ctrl + p` 然后在激活框中输入 `>` 打开命令行

在命令行中输入 `halo`，选择 Setup 进行初始化

按指示输入部署 halo 系统的 url 地址，和前面生成的 token 信息

![](/archives/halo-autopost/jxjo87.png)

### 文章发布

配置完 halo 的 url 以及 token 信息后，就可以进行文章发布了 

在 vscode 中打开编辑好的 markdown 文章，并且让文章处于激活状态

然后调出命令操作，选择 `Publish to Halo`，没问题的话文章就可以发布到 halo 系统中了

![](/archives/halo-autopost/k731pt.png)
