---
categories:
- 逆向分析
date: '2025-08-24 09:05:24+08:00'
description: ''
draft: false
image: ''
slug: anti-debug-09
cover: /archives/anti-debug-09/bgennv.png
tags:
- 逆向
title: 软件反调试（9）- 基于文件完整性的检测
---

## 前言

在前面的文章中，提到了一些基本的反调手段，事实上大部分的手段都作用不大，因为太容易被绕过了，只是从理论角度进行反调的学习

这里稍微升级一下，从基于文件完整性的角度进行反调试的学习，在这之前，补漏说明一下基于时间的反调

基于时间的反调理论也很简单，就是在关键代码前记录一下时间戳，接着在关键代码后记录一下时间戳，然后计算运行关键代码的时间差

通常来说，在没有被调试的情况下，运行关键代码的耗时不会太久（假定 100ms 内肯定能运行完毕），如果关键代码被调试了，那么这个时间差就会变大超过 100ms

实际反调的时候，对应的伪代码类似如下

```c++

ULONGLONG start = GetTickCount64();

//significant code 

ULONGLONG end = GetTickCount64();

if ((end - start) > 100) 
{
    std::cout << "Debugging..." << std::endl;
} 

```

## 反调原理

接着学习文件完整性的校验，在程序编译为执行文件的时候，会在 PE 文件中生成很多的段，包含代码段 .text 和数据段 .data，.text 段通常是只读的和可执行的

反调中的完整性保护就是对 .text 代码段进行校验，如 DIE 显示的 .text 段信息如下图

![](/archives/anti-debug-09/bgennv.png)

双击执行文件，将程序二进制加载到内存后，.text 段就会被加载到 0x140001000 的基址上，代码段的实际大小为 0x5200 

加载并初始化后，cpu 就从 .text 段中的入口点开始执行程序

文件的完整性校验逻辑读取这段内存的数据，并计算 hash，和程序的正确的 hash 值（这个值通常存储在服务端）进行比较，如果发现不一致则进行相应的处理

完整的步骤为

1、正常编译出执行文件（代码包含完整性校验逻辑、以及读取网络 hash 的逻辑）

2、使用额外的工具计算执行文件 .text 代码段的 hash，将 hash 值存储在网络服务端

3、执行文件启动的时候，计算 .text 段的 hash 值，并请求网络获取正确的 hash 值，两者进行比较

在一些特别的情况下，会导致 .text 代码段的变化

1、断点注入，之前提过，在下断点的时候，实际是在 .text 对应的代码位置首字节插入 0xcc 指令

2、程序补丁，包括 patch 到执行文件的补丁，以及程序运行时的动态补丁

另外还有如加壳程序保护，以及自身程序对 .text 段的修改，暂不在这里文件完整性校验的考虑范围内

## 代码实现

为简化代码，这里不使用网络请求获取的 hash 值，而是将 hash 计算后写入到本地 txt 文件中，然后在程序中读取 txt 的文本中的 hash 值

在实际部署的时候，还需要对不同发布版本的 hash 值进行维护，另外 hash 计算使用 [这里](http://www.zedwood.com/article/cpp-md5-function) 提供的 md5 封装实现，只需将对应的 md5.h 和 md5.cpp 直接引入到工程即可

完整的反调代码实现如下 

```c++
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <thread>
#include <string>
#include <windows.h>
#include "md5.h"

std::string GetHash()
{
    std::ifstream file("hash.txt");
    if (!file) {
        std::cerr << "can not open hash file" << std::endl;
        exit(-1);
    }

    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string content = buffer.str();

    file.close();
    return content;
}

bool GetTextSection(LPBYTE base, LPBYTE& text_start, DWORD& text_size) 
{
    PIMAGE_DOS_HEADER dosHeader = (PIMAGE_DOS_HEADER)base;
    PIMAGE_NT_HEADERS ntHeaders = (PIMAGE_NT_HEADERS)(base + dosHeader->e_lfanew);

    PIMAGE_SECTION_HEADER section = IMAGE_FIRST_SECTION(ntHeaders);
    WORD numberOfSections = ntHeaders->FileHeader.NumberOfSections;

    for (int i = 0; i < numberOfSections; ++i, ++section)
    {
        if (memcmp(section->Name, ".text", 5) == 0)
        {
            text_start = base + section->VirtualAddress;
            text_size = section->SizeOfRawData;
            return true;
        }
    }

    return false;
}

int CheckProcessIsDebugging()
{
    LPBYTE base = (LPBYTE)GetModuleHandle(NULL);
    LPBYTE text_start = nullptr;
    DWORD text_size = 0;

    if (!GetTextSection(base, text_start, text_size))
    {
        std::cout << "section .text not found" << std::endl;
        exit(-1);
    }

    std::string expected_hash = GetHash();
    std::string text((char*)text_start, text_size);
    std::string current_hash = md5(text);

    std::cout << std::hex << "0x" << reinterpret_cast<uintptr_t>(text_start) << "  0x" << text_size 
        << " expect hash:" << expected_hash << " current hash:" << current_hash << std::endl;

    return current_hash != expected_hash;
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


获取执行文件 .text 代码段的 hash 值可以使用 DIE 中计算的哈希进行右键复制，也可以使用 python 代码进行计算

![](/archives/anti-debug-09/45yhys.png)

使用 python 计算 .text 代码段的代码如下 

```python
import pefile

pe = pefile.PE('anti09.exe')

for section in pe.sections:
    print(f"Section Name: {section.Name.decode().strip()}")
    print(f"MD5 Hash: {section.get_hash_md5()}")
    print(f"SHA256 Hash: {section.get_hash_sha256()}")
```

## 逆向处理

如果仅仅是如此简单的文件完整性保护，那么绕过基本没有难度，直接定位到对应的代码直接 patch 掉就可以，这里不再描述

实际应用的时候，可能会采取动态计算的方式，比如

1、从网络获取回来的 hash 需要解密后再进行比较

2、将 .text 段分成多个片段，分别计算对应的 hash

3、动态完整性校验函数混淆，内联或者 JIT 即时编译生成，如使用 LLVM 构建 IR，在运行时通过 LLVM JIT 编译为机器码并执行

如下面是一段简单的 Linux 下 JIT 生成函数，这种方式可以将业务函数代码变成数据，实际应用中这段关键逻辑可能需要从网络中请求得到

```c++
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>

// 返回 42 的机器码 (x86_64 SysV ABI)
// mov eax, 42 ; ret
unsigned char code[] = { 0xB8, 0x2A, 0x00, 0x00, 0x00, 0xC3 };

int main() {
    size_t size = sizeof(code);

    // 分配可读写内存
    void *mem = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);

    memcpy(mem, code, size);

    // 改为可执行
    mprotect(mem, size, PROT_READ | PROT_EXEC);

    // 将内存当作函数调用
    int (*func)() = (int (*)())mem;
    int result = func();

    printf("JIT generated result = %d\n", result);

    munmap(mem, size);
    return 0;
}
```

4、将完整性校验逻辑虚拟化，使用VMProtect、Themida、Tigress等虚拟机保护逻辑

5、自修改代码 + 多线程动态校验，使用自解密机制运行代码，如仅解密一小段指令到内存后再加密回去

这里仅罗列部分高级的对抗技术，后续会在前面的基础上，持续学习加入多种对抗手段的反调逻辑，尽量向实际应用靠拢