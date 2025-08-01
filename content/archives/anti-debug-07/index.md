---
categories:
- 逆向分析
date: '2025-08-01 10:51:24+08:00'
description: ''
draft: false
image: ''
slug: anti-debug-07
cover: /archives/anti-debug-07/f7pdpk.png
tags:
- 逆向
title: 软件反调试（7）- 基于NtSetInformationThread设置线程信息
---



## 反调原理

NtSetInformationThread 和 ZwSetInformationThread 是本质相同的函数，Nt 位于 ntdll.dll 模块，在用户模式下供应用程序调用

Zw 位于内核模式中，供驱动/内核模块使用，它们的调用关系如下 

`NtSetInformationThread -> syscall -> 内核 -> ZwSetInformationThread（或统一的内核服务处理函数）`

通过 NtSetInformationThread 设置线程的某些属性，可以对调试器的行为造成干扰，最常见的反调试用途是 `隐藏线程`

函数原型如下

```c++
__kernel_entry NTSYSCALLAPI NTSTATUS NtSetInformationThread(
  [in] HANDLE          ThreadHandle,
  [in] THREADINFOCLASS ThreadInformationClass,
  [in] PVOID           ThreadInformation,
  [in] ULONG           ThreadInformationLength
);
```

当 ThreadInformationClass 参数设置为 ThreadHideFromDebugger (0x11) 时，会通知系统 “隐藏当前线程”，对于某些调试器而言

会导致它们在断点设置、单步执行或监视线程行为时失败，某些断点会被绕过，在 “调试时段检测” 或 “异常处理” 类的反调试方法中特别有效

该函数仅对设置的线程生效，但对其他未设置的线程无效，其他线程依旧可被调试，如果需要隐藏所有的线程，需要对每个线程都进行设置

由于一些业务线程的启动时间是不确定的，实现上可以使用循环设置，每次循环都将进程中的所有线程全部设置一遍，对单个线程多次重复设置是不会有任何影响的

不过 x64dbg 已完全绕过或忽略这个反调试标志，NtSetInformationThread 在 x64dbg 中是没有效果的，该设置的主要目的是防止系统在该线程上触发调试事件通知

比如调试器用 WaitForDebugEvent() 时，隐藏线程的异常不会被推送过去，由于 x64dbg 不依赖这种调试事件转发，它是直接去查看内存、断点、指令流的

在 vs2022 的调试器（msvsmon）中可以生效，导致其在调试时无法正确处理该线程的调试事件，从而出现挂起、卡死、无法断点或丢失线程事件的现象

## 代码实现

完整实现代码如下，在 vs2022 中调试运行的时候，对代码下的断点是无效的，部分情况下会导致 vs2022 在调试的时候卡死

```c++ 
#include <iostream>
#include <thread>
#include <string>
#include <windows.h>
#include <TlHelp32.h>
#include <winternl.h>

typedef NTSTATUS(WINAPI* FnNtSetInformationThread)(
    HANDLE          ThreadHandle,
    THREADINFOCLASS ThreadInformationClass,
    PVOID           ThreadInformation,
    ULONG           ThreadInformationLength
);

bool SetThreadInfo(HANDLE hThread)
{
    HMODULE hModule = LoadLibrary("ntdll.dll");
    FnNtSetInformationThread fn = (FnNtSetInformationThread)GetProcAddress(hModule, "NtSetInformationThread");
    NTSTATUS status = fn(hThread, (THREADINFOCLASS)0x11, 0, 0);
    return (status == 0);
}

bool SetInformationThread()
{
    DWORD dwProcessId = GetProcessId(GetCurrentProcess());
    HANDLE hThreadSnap = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);

    if (hThreadSnap == INVALID_HANDLE_VALUE)
        return false;

    THREADENTRY32 th32;
    th32.dwSize = sizeof(THREADENTRY32);
    BOOL bRet = Thread32First(hThreadSnap, &th32);
    while (bRet)
    {
        if (th32.th32OwnerProcessID == dwProcessId)
        {
            HANDLE hThread = OpenThread(THREAD_ALL_ACCESS, FALSE, th32.th32ThreadID);
            bool ok = SetThreadInfo(hThread);
            if (ok) {
                std::cout << "hide thread succ:" << th32.th32ThreadID << std::endl;
            }
            else {
                std::cout << "hide thread fail:" << th32.th32ThreadID << std::endl;
            }
            CloseHandle(hThread);
        }
        bRet = Thread32Next(hThreadSnap, &th32);
    }
    CloseHandle(hThreadSnap);
    return false;
}

void AntiThreadProc()
{
    while (true)
    {
        SetInformationThread(); //设置反调试
        std::this_thread::sleep_for(std::chrono::milliseconds(5000));
    }
}

void ThreadProc()
{
    while (true)
    {
        std::cout << "business Running, thread:" << std::this_thread::get_id() << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(5000));
    }
}

int main()
{
    std::thread thrd1(AntiThreadProc); 
    std::thread thrd2(ThreadProc);
    thrd1.join();
    thrd2.join();
    return 0;
}
```

## 逆向处理

基于 x64dbg 已经完全绕过了 NtSetInformationThread 的反调试，不需要进行任何设置即可实现绕过

查看效果可以使用 API HOOK 进行用户态劫持 NtSetInformationThread，这里基于开源的 MinHook 库进行实现，下载地址 https://github.com/TsudaKageyu/minhook

### 注入动态库

创建一个 inject.dll 工程，工程依赖 MinHook 库，包含两个代码文件，`dllmain.cpp` 代码如下，在 DLL_PROCESS_ATTACH 的时候调用 Hook 实现

```c++
#include <windows.h>

void Hook();

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        DisableThreadLibraryCalls(hModule);
        Hook();
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}
```

另一个代码文件 `hook.cpp` 完整代码如下，Hook 函数中将 `ntdll.dll` 中的 NtSetInformationThread 方法劫持到自定义的实现函数中 

Hook 方法调用的时候输出 `start to hook...`，在自定义的函数中，当调用到该函数的时候打印一句 `Hook is running...` 信息

```c++

#include <windows.h>
#include <winternl.h>
#include <iostream>
#include "MinHook.h"

typedef NTSTATUS(WINAPI* pNtSetInformationThread)(
    HANDLE          ThreadHandle,
    THREADINFOCLASS ThreadInformationClass,
    PVOID           ThreadInformation,
    ULONG           ThreadInformationLength
);

pNtSetInformationThread OriginalNtSetInformationThread = nullptr;

NTSTATUS NTAPI HookedNtSetInformationThread(
    HANDLE ThreadHandle,
    THREADINFOCLASS ThreadInformationClass,
    PVOID ThreadInformation,
    ULONG ThreadInformationLength
) {
    // 拦截 ThreadHideFromDebugger（0x11）
    if (ThreadInformationClass == (THREADINFOCLASS)0x11) {
        std::cout << "Hook is running..." << std::endl;
        return 0; // 伪装调用成功
    }

    return OriginalNtSetInformationThread(
        ThreadHandle, ThreadInformationClass, ThreadInformation, ThreadInformationLength
    );
}

void Hook() {
    MH_Initialize();

    std::cout << "start to hook..." << std::endl;
    HMODULE hNtdll = GetModuleHandleA("ntdll.dll");
    if (hNtdll) {
        void* pTarget = GetProcAddress(hNtdll, "NtSetInformationThread");
        if (pTarget) {
            MH_CreateHook(pTarget, &HookedNtSetInformationThread, (LPVOID*)&OriginalNtSetInformationThread);
            MH_EnableHook(pTarget);
        }
    }
}
```

### 注入程序

创建一个 MyHook 项目，实现将一个动态库注入到目标进程中，运行的时候接受两个参数，目标进程ID，以及待注入的动态库

主要原理如下

1、打开目标进程，获取对目标进程的所有权限（读写内存、创建线程等）

2、使用跨进程分配内存的 VirtualAllocEx 函数，在目标进程内分配一段读写内存，用于存放 DLL 路径字符串

3、把 DLL 路径字符串写入到刚才分配的远程内存中，这就是远程线程中将被 LoadLibraryA 加载的参数

4、获取本进程中 kernel32.dll 中 LoadLibraryA 的地址，因为 kernel32.dll 是系统 DLL，系统中的所有进程是一定会加载的

5、在目标进程中创建一个线程，入口是 LoadLibraryA，参数是我们写入的 DLL 路径，从而把 DLL 加载进自己的地址空间

完整代码如下 

```c++
#include <windows.h>
#include <tlhelp32.h>
#include <tchar.h>
#include <iostream>

BOOL InjectDLL(DWORD dwPID, const char* dllPath) 
{
    HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, dwPID);
    if (!hProcess) 
    {
        std::cerr << "OpenProcess failed\n";
        return FALSE;
    }

    LPVOID pRemoteMemory = VirtualAllocEx(hProcess, nullptr, strlen(dllPath) + 1, MEM_COMMIT, PAGE_READWRITE);
    if (!pRemoteMemory)
    {
        std::cerr << "VirtualAllocEx failed\n";
        CloseHandle(hProcess);
        return FALSE;
    }

    WriteProcessMemory(hProcess, pRemoteMemory, dllPath, strlen(dllPath) + 1, nullptr);

    LPTHREAD_START_ROUTINE pLoadLibrary = (LPTHREAD_START_ROUTINE)GetProcAddress(GetModuleHandleA("kernel32.dll"), "LoadLibraryA");

    HANDLE hThread = CreateRemoteThread(hProcess, nullptr, 0, pLoadLibrary, pRemoteMemory, 0, nullptr);
    if (!hThread) 
    {
        std::cerr << "CreateRemoteThread failed\n";
        VirtualFreeEx(hProcess, pRemoteMemory, 0, MEM_RELEASE);
        CloseHandle(hProcess);
        return FALSE;
    }

    WaitForSingleObject(hThread, INFINITE);

    VirtualFreeEx(hProcess, pRemoteMemory, 0, MEM_RELEASE);
    CloseHandle(hThread);
    CloseHandle(hProcess);

    return TRUE;
}

int main(int argc, char** argv)
{
    if (argc != 3) 
    {
        std::cout << "Usage: <MyHook.exe> <pid> <inject.dll>";
        return -1;
    }

    DWORD pid = atoi(argv[1]);
    const char* dllPath = argv[2];

    if (InjectDLL(pid, dllPath))
    {
        std::cout << "DLL injected successfully!\n";
    }
    else
    {
        std::cerr << "DLL injection failed.\n";
    }

    return 0;
}
```

### 逆向效果

将前面的动态库编译为 `inject.dll`，执行文件编译为 `MyHook.exe`，然后运行反调试的 `anti07.exe` 执行文件

开始的时候 `anti07.exe` 正常运行，接着运行 `MyHook.exe 37080 inject.dll` 将动态库进行注入，输出 `Hook is running...` 信息

在目标进程的模块列表中，也可以看到 `inject.dll` 动态库记录项，说明已经达到了预期的效果

![](/archives/anti-debug-07/7aqjyx.png)

![](/archives/anti-debug-07/f7pdpk.png)