---
categories:
- 默认分类
date: '2024-11-28T14:18:16'
description: ''
draft: false
image: ''
slug: build-halo
tags:
- Halo
title: halo 系统的构建
cover: /archives/build-halo/image-baym.png
---

为了构建 halo 在本地运行以便测试，请按照官方的指引进行构建，这里记录的仅是部分重要的信息

以下基于 2.20.9 版本进行本地编译

## halo 项目构成

halo 为 java 开发的项目，并集成了前端 vue 的项目，主体分为两部分

1、application 为后端项目

2、ui 为前端页面项目

![](/archives/build-halo/image-baym.png)

## 编译前端代码

使用 idea 打开 halo 项目后，在配置中选择 `halo:ui [build]` ，然后点击开始按钮进行构建

构建完毕最后下面显示信息 “BUILD SUCCESSFUL” ，ui 的目录下生成了一个 build 文件夹，dist 中显示有一个 console 和 uc 目录

![](/archives/build-halo/image-dslh.png)

## 编译后端代码

使用 idea 打开 halo 项目后，在配置中选择 `halo [bootJar]` ，然后点击开始按钮进行构建

构建完毕最后下面显示信息 “BUILD SUCCESSFUL” ，编译结果输出一个 jar 文件，在目录 halo\\application\\build\\libs 下

![](/archives/build-halo/image-jdvp.png)

查看 jar 包内容，可以看到打包了 api 依赖包（ api 包在 bootJar 编译的时候一起生成的），还有前端的两个编译结果 uc 和 console

![](/archives/build-halo/image-rzvs.png)

![](/archives/build-halo/image-keot.png)

## 本地运行

至此前后端已经编译完成，如果不是调试需要，在本地运行的话，直接运行 jar 包就可以了

spring.config.additional-location 指示一个路径，在该路径下应该要有一个 application.yaml 文件，以便本话化修改的一些配置项

如果不提供，则使用包中带的 yaml 文件，我的配置已经更新到包的 yaml 文件中了，使用默认路径的 work-dir: ${user.home}/.halo2

启动的参考命令如下，添加 debug 参数可以显示更多的调试信息 （服务端口在 yaml 文件中有配置）

```
java -Dfile.encoding=UTF-8 -jar halo.jar --spring.config.additional-location=optional:file:./halo/ --debug 
```

在浏览器中输入访问地址后回车显示如下页面，表示当前系统运行已经正常（我这已经初始化并且切换了 Joe3 主题）

![](/archives/build-halo/image-mtor.png)
