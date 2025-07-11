---
categories:
- 逆向分析
date: '2025-06-28T10:51:06'
description: ''
draft: false
image: ''
slug: anti-debug-01
tags:
- 逆向
title: 软件反调试（1）- 基于进程列表的检测
cover: /archives/anti-debug-01/f4fhdk.png
---

## 反调原理

在打开了调试器的情况下，在任务管理器中可以看到调试器的进程信息，通过枚举列表来进行检查当前是否打开了调试器

如果调试程序的执行文件被改名了，那么该检测方法就会失效，通常只能作为辅助的检查

![20250628091410](/archives/anti-debug-01/f4fhdk.png)


## 实现细节

使用 vs2022 新建 c++ 的控制台项目 `anti01`，并将工程的字符集改为 “多字节”

![20250628085207](/archives/anti-debug-01/e3hza1.png)

在工程的 main.cpp 文件中增加以下代码，通过 windows 的 TlHelp32 库来遍历进程，检查是否有目标进程在运行

这里只检查了 `x64dbg` 调试器名称，实现上需要检查所有的调试器名称

```c++
#include <iostream>
#include <thread>
#include <windows.h>
#include <TlHelp32.h>

bool CheckProcess(const char* szProcessName)
{
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE)
    {
        return false;
    }

    PROCESSENTRY32 pe32 = { 0 };
    pe32.dwSize = sizeof(PROCESSENTRY32);
    BOOL bRet = Process32First(hSnapshot, &pe32);
    while (bRet)
    {
        if (strstr(pe32.szExeFile, szProcessName) != NULL)
        {
            std::cout << "find debug process:" << pe32.szExeFile << std::endl;
            CloseHandle(hSnapshot);
            return true;
        }
        bRet = Process32Next(hSnapshot, &pe32);
    }

    CloseHandle(hSnapshot);
    return false;
}

void ThreadProc()
{
    while (true)
    {
        if (CheckProcess("x64dbg"))
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

## 运行结果

编译该代码生成 `anti01.exe` 执行文件，然后启动 `x64dbg`，在任务管理器中可以看到该进程信息，运行 `anti01.exe`，输出信息如下图

当业务进程检测到当前运行调试进程后，可以做出退出进程，或暂停业务等处理

![20250628091656](/archives/anti-debug-01/f64nxe.png)


## 逆向处理

为了尽量接近实现上，这里将修改编译模式为 release，然后运行 anti01.exe，并启动 x64dbg 附件到 anti01 进程上

附加到进程后，将运行模块切换到 anti01 模块上来，并右键搜索该模块下的字符串

![20250628093832](/archives/anti-debug-01/fj3me4.png)


字符串列表中可以看到关心的字符串，双击该记录跳转到该字符串引用的地址上

![20250628093911](/archives/anti-debug-01/fjbi9m.png)

可以看到内存地址中的 x64dbg 值，任意修改该值即可以

![20250628100458](/archives/anti-debug-01/gmju3o.png)

选定该部分内存右键填充输入任意字符，如 '0' 然后确定，将值修改为 '000000'

![20250628102330](/archives/anti-debug-01/gxop1y.png)

在 cpu 窗口中右键补丁，保存为修补文件 `anti01-hack.exe`，启动修补文件，就可以对调试器检测进行绕过了

![20250628102613](/archives/anti-debug-01/gz4nsq.png)


## 后记

一般情况下，是不会这么顺利达成的，比如反调试一般还会有动态内存、内存保护、文件完整性保护等其他额外的手段，就会导致无法修改

这里只是最基本的，通过进程列表的反调试以及绕过处理，暂不涉及这些复杂的场景

