---
categories:
- 逆向分析
date: '2025-07-02T19:43:52'
description: ''
draft: false
image: ''
slug: anti-debug-03
tags:
- 逆向
title: 软件反调试（3）- 基于父进程的检测
cover: /archives/anti-debug-03/vywa4l.png
---

## 反调原理

如果进程是正常运行起来的，那么其父进程应该是 explorer.exe，否则可能处于被调试状态

该检查方式只能进行有限检查，如果进程是通过附加的方式来进行调试的话，那么父进程的检查方式就会失效

如下通过 `procexp64` 可以查看进程的父进程是哪一个，`procexp64` 是微软出品的 `SysinternalsSuite` 工具包中的一款工具

![20250702193216](/archives/anti-debug-03/vywa4l.png)

## 实现代码

```c++
#include <iostream>
#include <thread>
#include <string>
#include <vector>
#include <windows.h>
#include <TlHelp32.h>

DWORD GetParentProcessId(DWORD nProcessId)
{
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE)
    {
        return 0;
    }

    PROCESSENTRY32 pe32 = { 0 };
    pe32.dwSize = sizeof(PROCESSENTRY32);
    BOOL bRet = Process32First(hSnapshot, &pe32);
    while (bRet)
    {
        if (pe32.th32ProcessID == nProcessId)
        {
            CloseHandle(hSnapshot);
            return pe32.th32ParentProcessID;
        }
        bRet = Process32Next(hSnapshot, &pe32);
    }
    CloseHandle(hSnapshot);
    return 0;
}

std::string GetProcessNameByProcessId(DWORD nProcessId)
{
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE)
    {
        return std::string("");
    }

    PROCESSENTRY32 pe32 = { 0 };
    pe32.dwSize = sizeof(PROCESSENTRY32);
    BOOL bRet = Process32First(hSnapshot, &pe32);
    while (bRet)
    {
        if (pe32.th32ProcessID == nProcessId)
        {
            std::string processName = pe32.szExeFile;
            CloseHandle(hSnapshot);
            return processName;
        }
        bRet = Process32Next(hSnapshot, &pe32);
    }
    CloseHandle(hSnapshot);
    return std::string("");
}

bool CheckParentProcess(const char* szProcessName)
{
    DWORD nProcessId = GetCurrentProcessId();
    DWORD nParentProcessId = GetParentProcessId(nProcessId);
    std::string processName = GetProcessNameByProcessId(nParentProcessId);
    std::cout << "parent:" << processName << std::endl;
    return (strstr(processName.c_str(), szProcessName) == NULL);
}

void ThreadProc()
{
    while (true)
    {
        if (CheckParentProcess("explorer"))
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

基于该方式的逆向，只需要在程序运行起来后，再使用调试工具对其附加调试即可

