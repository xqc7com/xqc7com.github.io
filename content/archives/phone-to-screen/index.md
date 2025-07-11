---
categories:
- 默认分类
date: '2025-01-11T11:26:00'
description: ''
draft: false
image: ''
slug: phone-to-screen
tags:
- android
- 小米手机
- 手机投屏
- scrcpy
title: 开源免费手机投控制器使用
cover: /archives/phone-to-screen/20250111110635107.png
---

Scrcpy 是一个开源的、轻量级的 Android 屏幕镜像工具

支持 USB 以及 Wi-Fi 连接，它提供高帧率的流畅体验，无需 root 权限

官方仓库地址 https://github.com/Genymobile/scrcpy 

要想手机能够投屏到电脑上，需要打开手机的 USB 调试配置

小米手机可以参考我的上一篇文章，软件安装的话下载压缩包解压就可以了

软件的目录结构如下，主要用到 adb 以及 scrcpy 这两个

![](/archives/phone-to-screen/20250111110635107.png)

## USB 连接投屏

手机通过 USB 连接到电脑，连接后手机弹出调试的提示，表示配置正常

在 scrcpy 软件的安装路径下，运行控制台命令窗口

![](/archives/phone-to-screen/20250111111003624.png)

通过 `adb devices` 命令可以查看当前已经连接的设备

通过 `scrcpy` 命令开启手机投屏，默认会连接列表显示的第一台设备

如果设备列表显示多台设备的话，那么可以通过 s 参数指定连接某台设备

scrcpy 还有很多的配置项，如果需要更精细的控制手机，可以查看 help 手册

没问题的话，控制台输出显示如下，还有一个手机界面的窗口

接下来就可以在电脑上控制手机了

![](/archives/phone-to-screen/20250111102146055.png)

![](/archives/phone-to-screen/20250111102551524.png)


## 通过 WIFI 连接

需要保证电脑和手机处于同一个 WIFI 网络环境下

然后手机通过 USB 连接到电脑，使得手机处于 USB 调试模式下 

并在电脑终端运行命令 `adb tcpip 5555` 

这个命令的意思是通过 USB 调试，在手机上开启一个 tcp 监听 5555 

![](/archives/phone-to-screen/20250111105817950.png)

监听建立之后，就可以拔掉 USB 连接线了，然后使用 adb connect 命令连接设备

接着使用 scrcpy 命令进行手机投屏了

如果需要关闭手机上的端口监听，可以在当前的终端窗口输入 `adb usb` 关闭

![](/archives/phone-to-screen/20250111110433012.png)


## 查看手机的 ip 地址

在设置中，点击已经连接的 WIFI，然后再点击 WIFI 右边的小箭头

然后网络详情界面就可以查看到手机的 ip 地址了

![](/archives/phone-to-screen/20250111111345485.png)

![](/archives/phone-to-screen/20250111111515543.png)

![](/archives/phone-to-screen/20250111111603045.png)
