---
categories:
- 逆向分析
date: '2025-07-20 17:25:24+08:00'
description: ''
draft: false
image: ''
slug: anti-debug-05
cover: /archives/anti-debug-05/8ceif7.png
tags:
- 逆向
title: 软件反调试（5）- 基于注册表实时调试器检测
---

## 反调原理

当程序发生异常崩溃的时候，如果设置了系统的调试器，那么就会启动调试器来调试该异常

这个信息是记录在注册表中的，win32 和 win64 版本分别是两个不同的路径，Debugger 表示调试器路径，Auto 为 1 表示启用自动附加调试

```c++
//32 位调试器的注册表路径
HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows NT\CurrentVersion\AeDebug

//64 位调试器的注册表路径
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\AeDebug
```

![](/archives/anti-debug-05/8ceif7.png)


在调试器中也可以进行设置，设置后将会覆写注册表这里的配置项，在程序发生异常时将会启动新设置的调试器来调试异常

比如，下面是 x64dbg 的设置，勾选的话将会修改注册表中的调试器配置

![](/archives/anti-debug-05/90ebbz.png)

![](/archives/anti-debug-05/n7en3v.png)

安装 visual studio 默认会添加这里的配置项，当检测到用户机器配置了 vs 调试器，并不一定需要中止进程，大部分安装 vs 的用户也不一定需要反调试

但是可能会将该用户的行为进行重点监控，反调试的权重是肯定会比普通用户高的，对于注册表配置是 x64dbg 这种的，那么就可以直接中止进程并提示警告

## 实现代码

检测注册表实时调试器的完整的代码如下：

```c++
#include <iostream>
#include <thread>
#include <string>
#include <vector>
#include <windows.h>
#include <TlHelp32.h>

bool CheckProcessIsDebugging()
{
    BOOL isx64 = FALSE;
    HKEY hKey = NULL;
    char key[] = "Debugger";
    char regValue[MAX_PATH] = { 0 };
    DWORD dwType = 0, dwLegth = MAX_PATH;
    char reg32[] = "SOFTWARE\\WOW6432Node\\Microsoft\\Windows NT\\CurrentVersion\\AeDebug";
    char reg64[] = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\AeDebug";

    //判断当前进程版本
    IsWow64Process(GetCurrentProcess(), &isx64);

    RegCreateKey(HKEY_LOCAL_MACHINE, isx64 ? reg64 : reg32, &hKey);
    RegQueryValueEx(hKey, key, NULL, &dwType, (LPBYTE)regValue, &dwLegth);
    return (strstr(regValue, "debugger") != NULL);
}

void ThreadProc()
{
    while (true)
    {
        if (CheckProcessIsDebugging())
        {
            std::cout << "Debugging..." << std::endl;
        }
        else
        {
            std::cout << "Running..." << std::endl;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    }
}

int main()
{
    std::thread thrd(ThreadProc);
    thrd.join();
    return 0;
}
```

## 逆向处理

逆向处理也很简单，调试前将这里的配置删除即可，可以使用一个 bat 脚本来实现 

```bat
@echo off

echo 正在删除 32 位 JIT 调试器配置...
reg delete "HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows NT\CurrentVersion\AeDebug" /v Debugger /f
reg delete "HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows NT\CurrentVersion\AeDebug" /v Auto /f

echo 正在删除 64 位 JIT 调试器配置...
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\AeDebug" /v Debugger /f
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\AeDebug" /v Auto /f

echo 已完成删除。
pause
```