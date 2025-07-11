---
categories:
- 默认分类
date: '2024-11-26T19:20:52'
description: ''
draft: false
image: ''
slug: change-folder-icon
tags:
- c++
title: win下修改文件夹图标
---

运行需要准备两文件

config.txt 文件中每一行指定待修改图标的文件夹路径，review.ico 图标样本文件

vs2022下编译通过，使用 Unicode 字符集编码

```c++
#include <windows.h>
#include <shlobj.h>
#include <iostream>
#include <fstream>
#include <string>
#include <io.h>

//https://stackoverflow.com/questions/68941080/update-folder-icon-with-desktop-ini-instantly-change-c

void changeFolderCustom(const char* iconPath,  const char* folderPath)
{
    size_t outSize = 0, size = strlen(iconPath) + 1;
    wchar_t* wIcon = new wchar_t[size];
    mbstowcs_s(&outSize, wIcon, size, iconPath, size - 1);
    LPWSTR pIcon = wIcon;

    size_t outSize1 = 0, size1 = strlen(folderPath) + 1;
    wchar_t* wFolder = new wchar_t[size1];
    mbstowcs_s(&outSize1, wFolder, size1, folderPath, size1 - 1);
    LPWSTR pFolder = wFolder;

    // (fixed the initialization of some fields)
    SHFOLDERCUSTOMSETTINGS pfcs{};
    pfcs.dwSize = sizeof(SHFOLDERCUSTOMSETTINGS);
    pfcs.dwMask = FCSM_ICONFILE;
    pfcs.pszIconFile = pIcon;
    pfcs.cchIconFile = 0;
    pfcs.iIconIndex = 0;

    PCWSTR pszPath = pFolder;
    SHGetSetFolderCustomSettings(&pfcs, pszPath, FCS_FORCEWRITE);
}

int main()
{
    const char* iconPath = "review.ico";
    const char* configFile = "config.txt";

    std::ifstream file(configFile); // 替换为你要读取的文件路径
    if (!file.is_open()) {
        std::cout << "无法打开文件！" << std::endl;
        return 0;
    }

    std::string folderPath;
    while (std::getline(file, folderPath)) {
        if ((folderPath.length() > 0) && (_access(folderPath.c_str(), 0) != -1)) {
            std::cout << folderPath << std::endl;
            changeFolderCustom(iconPath, folderPath.c_str());
        }
    }

    file.close();
    return 0;
}
```
