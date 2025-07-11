---
categories:
- 默认分类
date: '2025-02-28T19:24:50'
description: ''
draft: false
image: ''
slug: php-debug
tags:
- vscode
- phpstudy
- xdebug
- php调试
title: vscode+phpstudy+xdebug调试php代码
cover: /archives/php-debug/srjem0.png
---

## vscode中安装xdebug

vscode 的插件中心中搜索 php debug 插件进行安装

![](/archives/php-debug/srjem0.png)


## 小皮中开启 xdebug 调试

小皮中选中要调试的 php 版本，这里配置 7.4.3 版本的

![](/archives/php-debug/st9tf5.png)

在弹出的设置窗口中，开启 xdebug 调试组件，端口如果需要的话可以修改

![](/archives/php-debug/styqry.png)

## 设置 php.ini 配置项

选中后，点击后使用记事本打开 php.ini 文件进行编辑

![](/archives/php-debug/svplsg.png)

在 php.ini 文件的最后，可以看到刚才设置的 xdebug 配置区块，并在后面加上下面两行

然后在小皮面板中重启 apache 服务

```ini
xdebug.remote_enable = 1
xdebug.remote_autostart = 1
```

![](/archives/php-debug/swez43.png)

## 修改 vscode 配置

打开 vscode 中的配置中心，搜索 php ，配置 PHP 和 PHP Debug 这两项

打开 settings.json 中编辑，增加两个配置项，分别对应  PHP 和 PHP Debug 配置

如果是 settings.json 文件的最后一行，后面不要带逗号

```json
"php.validate.executablePath": "d:/phpstudy_pro/Extensions/php/php7.4.3nts/php.exe",
"php.debug.executablePath": "d:/phpstudy_pro/Extensions/php/php7.4.3nts/php.exe"
```

![](/archives/php-debug/szw3hw.png)


## 创建 Lauch.json

回到 vscode 工程中，点击左侧的调试按钮，然后点击 “创建 lauch.json 文件”，在下拉的语言栏中选择 php 

![](/archives/php-debug/tuajic.png)

然后就会生成一个 lauch.json 文件，存储在当前工程的 .vscode 目录下，内容如下

这个创建的 lauch.json 通常不用修改，端口需要和前面的匹配上， lauch.json 文件中有两个 port 配置项

 
```json
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9000
        },
        {
            "name": "Launch currently open script",
            "type": "php",
            "request": "launch",
            "program": "${file}",
            "cwd": "${fileDirname}",
            "port": 0,
            "runtimeArgs": [
                "-dxdebug.start_with_request=yes"
            ],
            "env": {
                "XDEBUG_MODE": "debug,develop",
                "XDEBUG_CONFIG": "client_port=${port}"
            }
        },
        {
            "name": "Launch Built-in web server",
            "type": "php",
            "request": "launch",
            "runtimeArgs": [
                "-dxdebug.mode=debug",
                "-dxdebug.start_with_request=yes",
                "-S",
                "localhost:0"
            ],
            "program": "",
            "cwd": "${workspaceRoot}",
            "port": 9000,
            "serverReadyAction": {
                "pattern": "Development Server \\(http://localhost:([0-9]+)\\) started",
                "uriFormat": "http://localhost:%s",
                "action": "openExternally"
            }
        }
    ]
}
```

## vscode调试当前脚本

php 调试支持单文件调试以及 web 的方式调试，单文件调试不需要 phpstudy，phpstudy 是作为 web 调试时的容器

以单文件调试为例子，调试原理如下：

xdebug 是 php 的一个组件，在 vscode 启动调试时， vscode 监听了 9000 端口

xdebug 会在 php 运行时连接到 vscode 的 9000 端口建立一个通信通道

通过这个通道， xdebug 可以将 php 程序的运行状态传递给 vsode 从而实现调试信息显示


![](/archives/php-debug/uons5p.png)

调试的时候，需要先启动 `Listen for Xdebug`， 然后再启动 `Lauch currently open script`

这个调试的前提还需要设置 php 的环境变量，使得点击 `Lauch currently open script` 的时候能运行当前的 php 脚本

然后就可以进入调试状态了，执行流程中断在断点位置上（当然调试的是 vscode 中当前打开的 php 文件）

![](/archives/php-debug/upbiu2.png)

![](/archives/php-debug/uqfnot.png)

## vscode调试web脚本

和调试本地脚本类似，只不过 xdebug 组件是在 phpstudy 中被托管了，只需要点击 `Listen for Xdebug` 就行了

需要新建一个 web 服务，并且保持版本一致，修改的是哪个版本的 php.ini ，web 服务中就配置哪个版本的 php 

并将 test.php 文件置于 web 的根目录下

![](/archives/php-debug/f6kepm.png)

回到 vscode 中，点击 `Listen for Xdebug` 启动，然后浏览器中访问 http://localhost/test.php

就可以看到运行流程在断点处停了下来

![](/archives/php-debug/fddm63.png)


## web调试中断退出问题分析

在调试 php 的 web 代码的时候发现，大概在 40s 左右的时候，调试就会被中断了

phpstudy 中的 apache 和 php 还有 xdebug 都有一些超时的配置，但是都不搭边，改了也没效果

最后观察发现，是 php-cgi 进程退出导致调试中断了，在 apache 的配置文件中增加以下配置项，重启会调试就正常了

这里影响 php-cgi 退出的配置是 FcgidIOTimeout，默认 40 秒内没收到 cgi 进程的响应，apache 将终止该进程

```
<IfModule mod_fcgid.c>
  FcgidConnectTimeout 600
  FcgidIOTimeout 600
  FcgidIdleTimeout 600
  FcgidBusyTimeout 600
</IfModule>
```
