---
categories:
- 默认分类
date: '2025-07-21 16:27:24+08:00'
description: ''
draft: false
image: ''
slug: vscode-paste-iamge
tags:
- vscode
title: hugo博客优化PasteImage以及其他
cover: /archives/vscode-paste-iamge/5kncyx.png
---

## 前言

之前的博客是使用 halo 进行搭建的，前段时间迁移到了 hugo 构建，在 halo 中文章的图片是保存到自建的 easyimage 图床上的

在迁移到 hugo 后，图片不再需要保存到图床上，直接保存在 md 文件的当前目录下即可，基于 hugo 的配置，完整路径为 `/archives/xxx/phndmy.png` 这种格式

其中 xxx 为当前 md 文件的目录，`phndmy` 为图片的随机名称，在 vscode 中本身也支持 `ctrl + v` 粘贴剪切板中的图片，但是并不支持这种自定义路径和随机文件名


## PasteImage插件

vscode 插件市场里面有很多同类插件，其中安装量最大的是下面这款，从最后 commit 的时间来看，已经是 6 年前的了 

![](/archives/vscode-paste-iamge/5kncyx.png)

查看该插件的配置说明，也并不支持这种自定义路径和随机文件名，结合部署的 hugo 站点情况，需要实现

1、在 paste 剪切板图片的时候，对图片进行重命名，支持使用非时间格式随机字符串进行命名

2、粘贴图片的时候，md 内容支持路径自定义，需要使用 md 文件的当前文件夹名称，但插件不支持获取这个名称，只有完整路径

于是，在原来实现的基础上，增加了以上逻辑

补充了一个随机文件名，当 `pasteImage.defaultName` 配置值为 `random` 的时候，使用了 6 位随机文件名

在非 `random` 的时候，默认的时间格式调整为 `YYYYMMDDHHmmss`，去掉了原来的横杠，如果配置其他的时间格式，按旧的逻辑处理

另外还增加一个 `${currentFileFolder}` 变量，获取当前的文件夹名称（不带完整路径），除此之外插件其他逻辑保持不变

代码已提交到 https://github.com/xqc7com/vscode-paste-image，并将编译的 vsix 插件也提交到仓库上了，版本号命名为 1.0.5

## 插件使用

如果需要安装的后，下载插件后，在 vscode 中通过以下方式，从打开的窗口中选择 vsix 文件进行安装 

![](/archives/vscode-paste-iamge/owz0ow.png)

在安装插件后，在 vscode 的配置文件 settings.json 中，增加以下两个配置项 

```
    "pasteImage.defaultName": "random",
    "pasteImage.insertPattern": "![](/archives/${currentFileFolder}/${imageFileName})",
```

在编写文章时正常截图后，在 md 文件中按下 `ctrl + alt + v` 粘贴图片，就会在同路径下生成一个图片文件，并插入一行文本，效果如下 

![](/archives/vscode-paste-iamge/930ioj.png)

这种方式适合在 hugo 中进行预览，如果需要 md 文件预览，需要补全为当前项目的路径，比如 `![](/content/archives/vscode-paste-iamge/owz0ow.png)` 这样

## hugo的其他改进

### md文件front-matter生成

在 front matter 中有一个 date 时间，通过增加一个 snippet 代码片段

![](/archives/vscode-paste-iamge/oon49f.png)

在 markdown.json 文件中增加以下代码，并在 md 文件输入 time 时按下 `ctrl + space` 的时候回车插入一个时间戳

```
{
	"Insert Current Time": {
	  "prefix": "time",
	  "body": [
		"${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE} ${CURRENT_HOUR}:${CURRENT_MINUTE}:24+08:00"
	  ],
	  "description": "Insert current time in yyyy-mm-dd hh:mm:ss format"
	}
}
```

### 图片路径补全为完整路径

在 csdn 中进行发布的时候，平台并不认识这些 `/archives/vscode-paste-iamge/owz0ow.png` 图片地址，因此需要转换为完整的带域名路径

在 blog 项目的 .vscode 目录下增加两个文件 tasks.json 和 update_domain.py

![](/archives/vscode-paste-iamge/p1xutt.png)

tasks.json 文件内容如下 

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "生成 CSDN 发布文件",
            "type": "shell",
            "command": "python",
            "args": [
                ".vscode/update_domain.py",
                "${file}"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "presentation": {
                "reveal": "always",
                "panel": "shared"
            }
        }
    ]
}
```

update_domain.py 文件内容如下 

```python
import re
import sys

DOMAIN = "https://www.xqc7.com"

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(
        r'(!\[.*?\])\(\s*(/.*?)\)',
        rf'\1({DOMAIN}\2)',
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"update domain succ: {file_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python update_domain.py markdown_file.md")
    else:
        process_file(sys.argv[1])
```

当需要将文章发布到 csdn 等其他平台的时候，在 md 文件激活的情况下，按下 `ctrl + shift + B`，自动将当前 md 文件中的路径进行域名补全












