---
categories:
- 默认分类
date: '2025-06-12T10:40:11'
description: ''
draft: false
image: ''
slug: ida-python
tags:
- ida
title: 多版本IDA分别使用不同的python版本
cover: /archives/ida-python/h52yov.png
---

机器上安装了多个版本的 IDA 工具，不同的 IDA 使用不同的版本的 python 解释器

如果只安装单个 IDA ，只需要使用 idapyswitch.exe 进行指定就可以了

idapyswitch 会将配置写入到注册表 `HKEY_CURRENT_USER\SOFTWARE\Hex-Rays\IDA` 目录的 Python3TargetDLL 键下

这个配置值是每个版本 IDA 都要读取的，也就是说不同版本的 IDA 都使用这个值进行来确定 python 解释器

网上搜了一下，似乎没有很好的解决方案

于是在每个 IDA 的安装目录下增加一个 start.bat 脚本，通过脚本来启动 IDA，脚本中的 python 以实际版本为准

启动前更新一下注册表值为当前路径下的 python 解释器

```shell
@echo off
reg add "HKCU\Software\Hex-Rays\IDA" /v "Python3TargetDLL" /t REG_SZ /d "python38\python3.dll" /f
start "" "ida64.exe"
```

这样在启动 IDA 后，检查每个 IDA 中的 python 解释器都是自己目录下的

![20250612103642](/archives/ida-python/h52yov.png)

![20250612103654](/archives/ida-python/h55k7n.png)
