---
categories:
- 逆向分析
date: '2025-07-02T19:10:26'
description: ''
draft: false
image: ''
slug: anti-debug-02
tags:
- 逆向
title: 软件反调试（2）- 基于窗口列表的检测
cover: /archives/anti-debug-02/u1bpzq.png
---

## 反调原理

通过枚举屏幕上所有的窗口，来检测当前是否打开了调试器

EnumWindows 枚举的时候，会进行窗口回调处理，直到所有窗口回调都结束后函数才返回

VS 提供了 Spy++ 可以查看窗口的信息，通过工具下的菜单可以打开 Spy++ 程序

![20250702181531](/archives/anti-debug-02/u1bpzq.png)

打开 Spy++ 程序，并打开其搜索窗口，左键按下窗口上的圆饼，并将光标拖动到应用的窗口上

这时候，搜索窗口上就会显示要查看窗口的信息，如这里显示窗口标题为 `x64dbg [管理员]`

![20250702182006](/archives/anti-debug-02/u3xabw.png)

在打开 x64dbg 的情况下，通过 CheckDebugWindowByEnum 函数，编译并运行 anti02.exe 程序，终端显示输出如下的信息

![20250702185742](/archives/anti-debug-02/uqefrh.png)


除了通过 EnumWindows 的方式进行枚举，也可以通过 GetWindow 的方式进行遍历查找窗口

每个进程的主窗口通常都是顶级窗口，一个进程通常会有一个到多个顶级窗口，可以通过遍历顶级窗口搜索目标进程

通过 CheckDebugWindowByFind 函数，编译并运行 anti02.exe 程序，终端显示输出如下的信息

![20250702185659](/archives/anti-debug-02/upwuz2.png)

## 实现代码

完成的实现代码如下，包含前面说的两种方式 CheckDebugWindowByEnum 和 CheckDebugWindowByFind

```c++

#include <iostream>
#include <thread>
#include <string>
#include <vector>
#include <windows.h>
#include <TlHelp32.h>

BOOL isDebugging = FALSE;
std::string g_szWindowsTile = "";

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam)
{
    char windows_title[256] = { 0 };
    char class_name[256] = { 0 };
    GetWindowText(hwnd, windows_title, 256);
    if (strlen(windows_title) > 0 && strstr(windows_title, g_szWindowsTile.c_str()) != 0)
    {
        std::cout << "handle:" << hwnd << " find debug windows:" << windows_title << std::endl;
        isDebugging = TRUE;
    }
    return TRUE;
}

bool CheckDebugWindowByEnum(const char* szWindowTitle)
{
    isDebugging = false;
    g_szWindowsTile = szWindowTitle;
    EnumWindows(EnumWindowsProc, NULL);
    return isDebugging;
}

bool CheckDebugWindowByFind(const char* szWindowName)
{
    std::vector<HWND> vec;
    HWND hWnd = GetTopWindow(0);
    while (hWnd)
    {
        if (GetParent(hWnd) == 0)
        {
            vec.push_back(hWnd);
        }
        hWnd = GetWindow(hWnd, GW_HWNDNEXT);
    }

    char szTempName[MAX_PATH] = { 0 };
    for (auto& v : vec)
    {
        GetWindowTextA(v, szTempName, MAX_PATH);
        if (strstr(szTempName, szWindowName) != 0)
        {
            std::cout << "find debug windows:" << szTempName << std::endl;
            return true;
        }
        memset(szTempName, 0, sizeof(szTempName));
    }

    return false;
}

void ThreadProc()
{
    while (true)
    {
        if (CheckDebugWindowByFind("x64dbg")) //CheckDebugWindowByEnum("x64dbg")
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

和前面的[基于进程列表的检测]一样，修改内存中的 `x64dbg` 字符串，然后保存到补丁文件

重新运行补丁过的文件，已经去掉了基于窗口列表的反调试检测

