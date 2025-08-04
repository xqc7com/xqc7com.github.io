---
categories:
- 逆向分析
date: '2025-08-04 10:52:24+08:00'
description: ''
draft: false
image: ''
slug: anti-debug-08
cover: /archives/anti-debug-08/cjj8nb.png
tags:
- 逆向
title: 软件反调试（8）- 基于SEH异常的检测
---

## 反调原理

### 异常处理

SEH（Structured Exception Handling）是 windows 提供的一种结构化异常处理机制，用于捕捉并处理运行时异常（如除以零、访问无效内存等）

基本结构如下

```c++
__try {
    // 可能抛出异常的代码
}
__except(EXCEPTION_EXECUTE_HANDLER) {
    // 异常处理代码
}
```

目标程序在被调试时，程序触发的异常会被调试器优先处理，而不是程序的 SEH 来处理

调试器先收到 "first-chance exception" 通知，如果调试器选择不处理，异常将会传递给程序的 SEH 来进行处理

如果 SEH 也不处理该异常，调试器将会再次收到 "second-chance exception" 通知，这个就是 x64dbg 异常配置中第一次、第二次机会的含义 

![](/archives/anti-debug-08/cjj8nb.png)

基于这个处理思路，那么可以在程序中主动触发一个异常，然后设置自己的 SEH 来处理它

如果程序能捕获并处理该异常，说明当前没有调试器干扰；如果异常没有进入自己的处理函数，被调试器抢先处理，说明当前正在被调试中

**但是在现代的调试器中，大部分的异常都不会被调试器进行处理，比如程序抛出的除零异常**

在 vs2022 中，如果勾选了除零异常（在 “调试” -> “窗口” -> “异常设置” 中），调试的时候就会中断在异常位置，F5 会继续执行，调试器并不会处理该异常

如果不勾选，那么异常发生的时候，是不会出现中断提示的

![](/archives/anti-debug-08/j118ab.png)


![](/archives/anti-debug-08/hy6fzm.png)

但是，有一种异常调试器是必须得处理的，那么就是 `int 3` 异常，这个就是调试器的异常，要理解这个异常，需要对程序是怎么调试有一点简单理解

### 调试异常

软件调试的断点分为三种：软件断点、内存断点、硬件断点，这里仅对软件断点进行描述

软件断点的本质是，在进行调试时候下的断点，断点指令的第一个字节被替换成为了 0xcc，也就是汇编 `int 3` 指令

当 eip 指令到该位置的时候，发现 `int 3` 指令，将会触发一个异常中断，这个异常就被调试器捕捉到了，因此程序在调试器中被中断下来

断点中断的时候，0xcc 恢复为原来的指令，中断运行过后，又被恢复为 0xcc，断点的指令情况可以从下面两个图来了解

但是在 vs2022 的汇编指令中，并不会显示 0xcc 指令，而是显示原来真实的指令，因此这里使用了 Process Hacker 查看进程的内存地址

代码中下了两个断点，第一个截图是中断在断点上的内存信息，第二个截图是调试到两个断点中间的内存信息

![](/archives/anti-debug-08/ohq789.png)

![](/archives/anti-debug-08/7r56mb.png)


## 代码实现

基于以上的知识点，就可以进行反调代码的编写了，这里使用到了 `int 3` 指令，是需要在代码中嵌入一小段汇编

在 vs2022 的 64 位 c++ 程序不支持在代码中内嵌汇编，只能将汇编代码独立为一个额外的 asm 文件，如果需要内嵌汇编只能编译 32 位的版本

以下是反调的完整代码实现

```c++

#include <iostream>
#include <thread>
#include <string>
#include <windows.h>  

bool CheckProcessIsDebugging()
{
    bool isDebugged = true;
    __try {
        _asm int 3;
    }
    __except (EXCEPTION_EXECUTE_HANDLER) {
        isDebugged = false;
    }
    return isDebugged;
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

编译后在 vs2022 中调试运行，终端输出 `Debugging...` 的提示信息，符合预期的反调试；直接运行程序终端输出 `Running...` 信息

但是在 vs2022 调试器对 `int 3` 做了特殊处理，发现 `int 3` 的时候，始终会中断程序，无视你的异常设置

因此，取消 Breakpoint 的勾选并，不会导致 vs2022 不会中断在代码行上，如下图所示

![](/archives/anti-debug-08/rsxpie.png)


## 逆向处理

鉴于 `int 3` 这些异常处理的反调试太过于基础，x32dbg/x64dbg 已经对这些反调进行了免疫，只需要将异常处理者设为 “被调试程序”，那么所以异常统统都不处理

其实这个反调已经没有逆向的必要了，如果需要逆向绕过的话，可以将这段 `int 3` 指令直接 nop 掉即可，这里就不描述了

![](/archives/anti-debug-08/yjblfi.png)

