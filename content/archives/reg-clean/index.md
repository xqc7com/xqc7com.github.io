---
categories:
- 默认分类
date: '2024-11-26T19:05:22'
description: ''
draft: false
image: ''
slug: reg-clean
tags:
- windows
title: 注册表批量删除项记录
cover: /archives/reg-clean/image-jeud.png
---

某些软件在安装的时候，会生成大量的注册表记录，但在卸载的时候，并不会进行清理，时间长了就会留下很多垃圾

这里使用代码加脚本的方式来实现指定删除，遍历符合规则的注册表项，如 “HKEY\_CLASSES\_ROOT\\AD\*“ 的注册表项

```c++
#include <stdio.h>
#include <Windows.h>

int main(int argc, char* argv[])
{
    int i = 0;
    while (1)
    {
        DWORD dwKeyNameSize = 128;
        char  szKeyName[128] = { 0 };
        int retCode = RegEnumKeyEx(HKEY_CLASSES_ROOT, i, szKeyName, &dwKeyNameSize, NULL, NULL, NULL, NULL);
        if (retCode == ERROR_NO_MORE_ITEMS)
        {
            break;
        }

        if ((szKeyName[0] == 'A') && (szKeyName[1] == 'D'))
        {
            printf("reg delete \"HKCR\\%s\" /f\n", szKeyName);
        }

        i++;
    }

    return 0;
}
```

根据执行文件生成批处理文件（使用重定向 > 将终端输出保存到文件 del.bat ）

这样 del.bat 文件的格式都是可以执行的命令，操作的时候直接双击 del.bat 进行删除即可

![](/archives/reg-clean/image-jeud.png)

![](/archives/reg-clean/image-vlba.png)
