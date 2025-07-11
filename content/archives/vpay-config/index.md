---
categories:
- 安卓开发
date: '2025-02-14T12:27:48'
description: ''
draft: false
image: ''
slug: vpay-config
tags:
- android
- 推送通知
- 读取通知
title: V免签在小米手机中开启通知读取权限
cover: /archives/vpay-config/evv6o9.png
---

安卓手机中有两种通知权限：推送通知和读取通知，其中读取通知被列为高危动作

在安装了 v 免签后，运行的时候会进行权限的申请，弹出一个设置窗口

![](/archives/vpay-config/evv6o9.png)

在这里可以看到，应用被明确为不允许使用通知，需要用户进行手工授权

点击应用后，进入权限设置页面，在这里可以看到按钮是置灰状态的不可操作的

![](/archives/vpay-config/ex5yly.png)

点击该置灰的按钮，弹出提示表示 “受限制的设置”

![](/archives/vpay-config/expo1v.png)

回到前面的窗口，点击应用图标的位置，进入授权设置的页面

这里是最关键的地方，以前是在右上角有几个点的，现在被隐藏到这里来了

![](/archives/vpay-config/eyag8w.png)

在这个权限配置的页面上，可以进行两种权限的授权

上面的 “通知” 表示发送通知，这些通知会在任务栏中显示出来

下面的 “更多” 表示读取通知栏消息，这里的通知栏包含所有的应用，属于高危动作 

![](/archives/vpay-config/ezg4ys.png)

点击 “更多”，弹出一个 “允许受限制的设置”

![](/archives/vpay-config/f1dppy.png)

点击 “允许受限制的设置” 后，弹出一个高危窗口，等待10s钟后，勾选知晓并点击确定

再回到前面的 “授予通知权限” 就可以正常授权了

![](/archives/vpay-config/f7bcs6.png)
