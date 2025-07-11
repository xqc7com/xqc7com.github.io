---
categories:
- 逆向分析
date: '2025-07-04T17:46:57'
description: ''
draft: false
image: ''
slug: anti-debug-04
cover: /archives/anti-debug-04/oxf5o6.png
tags:
- 逆向
title: 软件反调试（4）- 基于IsDebuggerPresent的检测
---

## 反调原理

该检测方式使用 IsDebuggerPresent 或者 CheckRemoteDebuggerPresent 函数，这两个函数都是 kernel32.dll 中实现的

对于 IsDebuggerPresent 函数，如果返回值为 TRUE，那么表示当前进程在调试器上下文中运行

CheckRemoteDebuggerPresent 的底层是通过 NtQueryInformationProcess 函数来实现的，函数接受一个 BOOL 的指针参作为返回值

函数调用成功的时候返回非零值，这时候检查出参 pbDebuggerPresent 指针的值，如果值为 TRUE，那么表示当前进程正在被调试中

使用这两个函数需要引用 windows.h 头文件，函数的原型分别如下

```c++
BOOL IsDebuggerPresent();

BOOL CheckRemoteDebuggerPresent(HANDLE hProcess, PBOOL pbDebuggerPresent);
```

IsDebuggerPresent 实际上是查询当前进程的 PEB（Process Environment Block）中的 BeingDebugged 字段

PEB 结构是进程环境块，是 Windows 内核中一个核心的内部数据结构，包含了进程的大量信息，在 `Windows SDK` 的 winternl.h 提供了部分定义

PEB 的结构如下，IsDebuggerPresent 使用了第二个字段 BeingDebugged，当被调试的时候该字段值被置为 1 

```c++
typedef struct _PEB {
    BYTE Reserved1[2];
    BYTE BeingDebugged;
    BYTE Reserved2[1];
    PVOID Reserved3[2];
    PPEB_LDR_DATA Ldr;
    PRTL_USER_PROCESS_PARAMETERS ProcessParameters;
    PVOID Reserved4[3];
    PVOID AtlThunkSListPtr;
    PVOID Reserved5;
    ULONG Reserved6;
    PVOID Reserved7;
    ULONG Reserved8;
    ULONG AtlThunkSListPtr32;
    PVOID Reserved9[45];
    BYTE Reserved10[96];
    PPS_POST_PROCESS_INIT_ROUTINE PostProcessInitRoutine;
    BYTE Reserved11[128];
    PVOID Reserved12[1];
    ULONG SessionId;
} PEB, *PPEB;
```

## 实现代码

完整的反调试的实现代码如下

```c++
#include <iostream>
#include <thread>
#include <string>
#include <vector>
#include <windows.h>
#include <TlHelp32.h>
#include <winternl.h>

bool CheckProcessIsDebuging()
{
    //return IsDebuggerPresent();

    BOOL isDebugging = FALSE;
    HANDLE hHandle = GetCurrentProcess();
    CheckRemoteDebuggerPresent(hHandle, &isDebugging);
    return isDebugging;
}

void ThreadProc()
{
    while (true)
    {
        if (CheckProcessIsDebuging())
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

### 对于 IsDebuggerPresent 的绕过

x64dbg 附加载入 anti04.exe 后，在符号窗口中选中主模块，然后右侧查看到模块，显示它的一个导入函数 IsDebuggerPresent 

![20250704150632](/archives/anti-debug-04/oxf5o6.png)

选定 kernel32.IsDebuggerPresent 然后右键 “在内存窗口中转到”，内存窗口中显示了 IAT 表的该函数的导入项

内存的值即是 kernel32.IsDebuggerPresent 函数的实际地址，选择该内存地址，右键 “搜索引用”

然后在引用页面中双击引用记录跳转到 IsDebuggerPresent 函数的调用处，然后在该 call 处进行下断点

![20250704163412](/archives/anti-debug-04/r1i9oz.png)

这里的绕过方式有两种，一个是在 call 之后 test 前修改 eax 的值为 0，但是这个只对当前的一次 call 调用生效

另一个是直接修改 peb 中的 BeingDebugged 字段值，需要先定位到 peb 的内存地址，然后再进行修改

关于 peb 地址是固定的 `gs:[60]`，其中 gs 是 TEB 的段寄存器，`gs:[0x60]` 是 `TEB + 0x60` 偏移处的值，是当前线程所属进程的 PEB 的地址

在左下角的命令框中输入 `gs:[60]` 后回车，然后下方显示出 peb 的内存地址，点击该地址在内存窗口中进行跳转

然后在该地址中，修改第三个字节为 0（未修改前为 1 表示在调试中），之后的运行就会显示程序未处于调试中了

![20250704163813](/archives/anti-debug-04/r3vua4.png)

在 x64dbg 中，可以通过 ScyllaHide 插件进行绕过，安装插件后，默认就已经勾选了对 BeingDebugged 的绕过

这里主要是学习反调试的基本原理，在此不会对插件的使用进行过多的说明

![20250704165219](/archives/anti-debug-04/rc9kns.png)


### 对于 CheckRemoteDebuggerPresent 的绕过

在 cpu 主窗口中 `ctrl + G` 输入 CheckRemoteDebuggerPresent 进行搜索，得到下面的地址

![20250704172952](/archives/anti-debug-04/smb096.png)

选中该行记录 entry 跳转到 CheckRemoteDebuggerPresent 函数的汇编代码位置

![20250704173702](/archives/anti-debug-04/sqrivy.png)

下面这两行的 `ds:[rdi]` 就是函数的第二个参数 pbDebuggerPresent，ebx = 0 或 1（是否检测到调试器）

`setne bl` 会根据前面 cmp 判断是否写入 `bl = 1`，因此将这句汇编进行覆盖即可，覆盖为清空 ebx

```
00007FF89ECC7B60     | 0F95C3                   | setne bl                                        |
00007FF89ECC7B63     | 891F                     | mov dword ptr ds:[rdi],ebx                      |
```

覆盖后的代码显示如下，这时候就可以实现了对 CheckRemoteDebuggerPresent 的绕过

![20250704174058](/archives/anti-debug-04/ssvxxb.png)





