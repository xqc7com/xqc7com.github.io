---
categories:
- 默认分类
date: '2025-04-11T14:22:16'
description: ''
draft: false
image: ''
slug: ubuntu-corefile
tags:
- ubuntu
title: ubuntu不生成core文件的处理
---

## 1、设置unlimited

`ulimit -a` 查看是否设置，没有设置的使用下面命令设置

```shell
ulimit -c unlimited
```

这个设置只在当前会话有效，添加到 ~/.bashrc 中，重开终端生效

## 2、sysctl配置

修改 `/etc/sysctl.conf` 文件 ，增加以下两个配置， core_uses_pid 表示 core 文件名是否使用 pid 

```shell
kernel.core_pattern = core
kernel.core_uses_pid = 1
```

修改后执行 `sysctl -p` 生效


## 3、apport配置

ubuntu 默认启用了 apport，它会拦截崩溃信息并生成错误报告，而不是直接生成 core 文件

禁止生成错误报告，修改 `vim /etc/default/apport`

```shell
enabled=0
```
