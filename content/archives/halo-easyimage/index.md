---
categories:
- 建站技能
date: '2025-01-24T18:10:55'
description: ''
draft: false
image: ''
slug: halo-easyimage
tags:
- halo
- markdown
- easyimage
title: halo附件图片迁移到easyimage图床
cover: /archives/halo-easyimage/fjbyyk.png
---

## 前言

在使用 markdown 编写文章之后，markdown 内容中引用的图片都是图床的地址

部分文章是在 halo 没有使用图床前，就已经发布了的，这些图片都是直接存储在 halo 系统中的

需要将这些文章的图片全部迁移到图床上，这些文章的图片在 halo 的附件中可以查看

![](/archives/halo-easyimage/fjbyyk.png)

## 图片迁移

### 图片下载

在 halo 系统中是没有直接下载图片操作的，可以直接登录主机进行下载

图片在 halo 的根目录下的 attachments 目录中，有两部分

upload 为文章中实际上传的原图，thumbnails 是不同尺寸的缩略图

缩略图可以不需要，可以使用 tar 命令将 upload 目录进行打包，然后将打包文件下载到本地

![](/archives/halo-easyimage/gmy6yp.png)

```
root@ubuntu:~/halo/attachments# tar -zcvf upload.tar.gz ./upload/
./upload/
./upload/image-shks.png
./upload/image-dnel.png
./upload/图片-vlba.png
./upload/image-dezw.png
./upload/图片-cgej.png
./upload/图片-zald.png

...

./upload/图片-vzka.png
./upload/image-lmyg.png
root@ubuntu:~/halo/attachments# 
```

### 图片重命名

下载图片之后，部分图片是使用中文 “图片” 直接命名的，需要将 “图片” 名称改为英文 “image”

这是因为在 halo 中发布文章的时候，直接在编辑器中粘贴的图片，halo 系统自行命名的

```python 
import os

def rename_files(directory):
    for filename in os.listdir(directory):
        if "图片" in filename:
            new_name = filename.replace("图片", "image")
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_name)
            if os.path.exists(new_path):
                print(f"文件名冲突，跳过重命名: {new_path}")
            else:
                os.rename(old_path, new_path)
                print(f"已重命名: {old_path} -> {new_path}")

directory_path = "/path/to/upload/"
rename_files(directory_path)
```

### 图片上传

将处理后的图片，上传到 easyimage 系统的图片目录中，可以指定一个日期目录，如 01/20 目录下

![](/archives/halo-easyimage/hc95rq.png)


## 修正文章

### 导出文章

文章不支持统一修改图片迁移，这里使用 vccode 插件将文章导出 markdown，然后在此基础上修改

vscode 插件是 halo 官方发布的，可以参考 [基于halo使用vscode插件自动发布文章 ](https://blog.qc7.org/archives/halo-autopost)

在配置好 vscode 的 halo 插件之后，命令行输入 pull 选择 `Pull post from Halo` 回车

稍等一会，就会出现一个文章的下拉列表，勾选需要导出的文章，然后点击确定下载

![](/archives/halo-easyimage/iwnb77.png)

![](/archives/halo-easyimage/iymv3x.png)

### 修改文章

文章下载到本地之后，就可以在 vscode 中直接对图片地址进行批量替换了

替换完之后，再通过插件将文章重新 post 发布到 halo 系统上去

![](/archives/halo-easyimage/jy3wy5.png)

### 混乱处理

部分情况下，如有源代码区块的话，通过插件 post 发布的文章可能会出现混乱的情况

可以在本地通过 `https://devtool.tech/html-md` 工具将文章主体转为纯 markdown 格式

复制转换后的内容，替换旧的格式，然后再 post 发布文章

![](/archives/halo-easyimage/qigamz.png)
