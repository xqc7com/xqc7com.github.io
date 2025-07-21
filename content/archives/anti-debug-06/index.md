---
categories:
- 逆向分析
date: '2025-07-21 11:51:24+08:00'
description: ''
draft: false
image: ''
slug: anti-debug-06
cover: /archives/anti-debug-06/q363dn.png
tags:
- 逆向
title: 软件反调试（6）- 基于NtQueryInformationProcess的检测
---



## 反调原理

NtQueryInformationProcess 是一个未公开的函数，函数原型如下，关于函数的更多信息可以参考官方的文档 [MSDN](https://learn.microsoft.com/zh-cn/windows/win32/api/winternl/nf-winternl-ntqueryinformationprocess)

```c++
__kernel_entry NTSTATUS NtQueryInformationProcess(
  [in]            HANDLE           ProcessHandle,
  [in]            PROCESSINFOCLASS ProcessInformationClass,
  [out]           PVOID            ProcessInformation,
  [in]            ULONG            ProcessInformationLength,
  [out, optional] PULONG           ReturnLength
);
```

使用 ProcessInformationClass 字段赋予不同值的方式来进行检测

```shell
0x00  检测PEB结构的调试标志
0x07  检测调试端口
0x1E  检测调试句柄
0x1F  检测调试标志
```

其中 0x00 之前分析过，使用的是 peb 结构中的 BeingDebugged 字段值，可以参考这里 https://www.xqc7.com/archives/anti-debug-04/

至于 CheckRemoteDebuggerPresent 的底层也是调用 NtQueryInformationProcess 实现的，这个之前也提过，其实就是基于 0x07 检测调试端口实现的

调试端口是调试器与被调试进程在内核中的通信通道，只有在调试的时候该调试端口才会存在

调试一个进程时，内核创建调试对象，调试对象被调试器以句柄的形式持有，句柄可以检测是否挂接调试对象，调试标志可以快速检测是否被调试

## 代码实现

基于 NtQueryInformationProcess 的四种反调试的完整实现代码如下

```c++
#include <iostream>
#include <thread>
#include <string>
#include <windows.h>
#include <winternl.h>

typedef NTSTATUS(WINAPI* FnNtQueryInformationProcess)(
    HANDLE           ProcessHandle,
    PROCESSINFOCLASS ProcessInformationClass,
    PVOID            ProcessInformation,
    ULONG            ProcessInformationLength,
    PULONG           ReturnLength
    );

bool CheckNtQueryInformationProcess()
{
    HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, GetCurrentProcessId());
    HMODULE hModule = LoadLibrary("ntdll.dll");
    if ((hProcess == INVALID_HANDLE_VALUE) || (hModule == INVALID_HANDLE_VALUE))
    {
        return false;
    }

    FnNtQueryInformationProcess fnProcess = (FnNtQueryInformationProcess)GetProcAddress(hModule, "NtQueryInformationProcess");
    if (fnProcess != INVALID_HANDLE_VALUE)
    {
        //0x00 检测PEB结构的调试标志
        /*
        PROCESS_BASIC_INFORMATION pbi = { 0 };
        DWORD dwSize = sizeof(PROCESS_BASIC_INFORMATION);
        DWORD dwRetLength = 0;
        fnProcess(hProcess, ProcessBasicInformation, &pbi, dwSize, &dwRetLength);
        PPEB peb = pbi.PebBaseAddress;
        if (peb != NULL)
        {
            return peb->BeingDebugged;
        }
        */

        //0x07 检测调试端口
        /*
        ULONG_PTR dwDebugPort = 0;
        fnProcess(hProcess, ProcessDebugPort, &dwDebugPort, sizeof(dwDebugPort), NULL);
        return (dwDebugPort != 0);
        */

        //0x1E 检测调试句柄
        /*
        HANDLE hHandle = NULL;
        fnProcess(hProcess, (PROCESSINFOCLASS)0x1E, &hHandle, sizeof(hHandle), NULL);
        return (hHandle != NULL);
        */

        //0x1F 检测调试标志
        /*
        BOOL bDebugFlag = FALSE;
        fnProcess(hProcess, (PROCESSINFOCLASS)0x1F, &bDebugFlag, sizeof(bDebugFlag), NULL);
        return (bDebugFlag == FALSE);
        */
    }
    return false;
}

void ThreadProc()
{
    while (true)
    {
        if (CheckNtQueryInformationProcess())
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

对于 BeingDebugged 的逆向处理，之前已经分析过了，可以修改内存中 peb 结构的 BeingDebugged 字段来绕过，这里不再分析

剩余几种反调方式，使用 Patch 的方式来绕过，商业上 Patch 需要过完整性的检测，这里暂不涉及

在 NtQueryInformationProcess 函数调用前，改变参数 ProcessInformationClass 入参值，下面是调试端口的情况，其他两种情况也是类似的

在 x64dbg 中定位到 NtQueryInformationProcess 函数的调用处，可以看到 `mov edx, 7` 的初始化代码，只要把这里的 7 改为无害的比如 0 就可以实现绕过

![](/archives/anti-debug-06/q363dn.png)

修改后汇编代码为如下，这样就可以实现对调试端口检测的绕过了 

![](/archives/anti-debug-06/zo5t0l.png)
