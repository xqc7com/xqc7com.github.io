---
categories:
- 建站技能
date: '2025-01-22T18:22:00'
description: ''
draft: false
image: ''
slug: easyimage-deploy
tags:
- PicGo
- gitee
- 图床
- easyimages
title: 使用easyimage部署个人图床服务
cover: /archives/easyimage-deploy/st8q55.png
---

## 前言

最开始使用的 gitee 作为个人图床，但总觉得不踏实，gitee 毕竟是公开的仓库，而且还是国内的服务

这两天考虑部署 easyimage 个人图床的时候，使用 picgo + web-uploader ，发现图片无法正常上传

于是瞅了一下 picgo-plugin-gitee 插件的源码参考，不曾想上面赫然写着，图床这个在几年前就被 gitee 废掉了

![](/archives/easyimage-deploy/st8q55.png)

还有一个重要的原因是自己手贱，本来想用 notepad++ 打开一个文本文件，结果给整到图床上去了

picgo 这个右键菜单 ”Upload pictures with PicGo” 也太便利了，竟然没对文件类型进行过滤就直接给上传了

文件虽然是删除了，也不是什么私密文件，但是  log 还在，万一哪天不小心把一些重要文件给上传就不好了

![](/archives/easyimage-deploy/stgt42.png)

![](/archives/easyimage-deploy/stu69l.png)

## 图床部署

开源的图床用的比较多的就是兰空和easyimage了，这里以easyiamge进行图床部署

官方地址 https://github.com/icret/EasyImages2.0 

代码下载后，放置于 phpstudy 的 WWW 目录下，新增一个站点指定目录就可以了

安装比较简单，不需要配置数据库什么的，打开站点首页，然后下一步基本就可以了

初始化一个管理员的账号密码

![](/archives/easyimage-deploy/sulp3h.png)

然后刷新首页，输入账号密码登录就可以了，登录后页面大致如下

可以在 “设置” 中进行更精细的配置，如显示权限，上传权限等

![](/archives/easyimage-deploy/sv49g8.png)

### 设置

如果使用接口进行图片上传，需要一个 api 地址，和一个授权的 token ，在 “设置” 中的 “API设置” 中进行设置

![](/archives/easyimage-deploy/swgupx.png)

### python代码上传图片

python 的参考代码如下，可以通过剪切板上传，或者读取文件上传

```python
import io
import requests
from PIL import ImageGrab

image_path = "./docs/images/225906016.png"
token = "1c17b11693cb5ec63859b091c5b9c1b2"
url = "http://192.168.10.200/api/index.php"

image = ImageGrab.grabclipboard()

if image:
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    files = {'image': ('screenshot.png', img_byte_arr, 'image/png')}
    data = {'token': token}
    print("upload image use clipboard...")
else:
    files = {'image': open(image_path, 'rb')}
    data = {'token': token}
    print("upload image use local image file...")

response = requests.post(url, files=files, data=data)

if response.status_code == 200:
    print("Upload successful, text:", response.text)
else:
    print(f"Upload failed with status code {response.status_code}.")

```

## PicGo 配置



### 安装插件以及配置

picgo 支持大部分的图床上传，但是官方并不直接支持 easyimage 图床

picgo 以提供插件支持的方式，方便为各种图床定制开发相应的上传插件

easyimage 官方推荐使用 web-uploader 插件，另外还有名为 “easyimage” 的插件

在 “插件设置” 中搜索，或者在 github 中搜索，将代码下载到本地，然后再 “导入本地插件” 也可以

![](/archives/easyimage-deploy/sy1228.png)

安装完插件后，输入配置信息，web-uploader 稍微有点不同，这里以 easyimage 插件进行说明

就配置 api 地址以及 token 就可以了

![](/archives/easyimage-deploy/sy8jt3.png)


### 插件问题分析

上面两个插件尝试了，发现都不能正常上传，估计是我环境的问题

分析的时候，easyimage 后端无法解析到 token ，网上搜了下也没有人提到这类问题

以 windows 为例，插件安装在以下目录中

C:\Users\Administrator\AppData\Roaming\picgo\node_modules

![](/archives/easyimage-deploy/symfv5.png)

实际上核心的文件只有一个 `picgo-plugin-easyimage\dist\index.js`  

尝试了好多次，也无法使用 PicGo 通过 easyimage 图床插件进行图片上传

只好将插件代码修改下，改为纯手动构建的请求包，然后就可以正常上传图片了

修改后的完整代码如下，有需要可以直接替换原文件的代码，然后重启 PicGo


```js
const UPLOADER = "easyimage";
module.exports = (ctx) => {
    const config = (ctx) => {
        let userConfig = ctx.getConfig("picBed." + UPLOADER);
        if (!userConfig) {
            userConfig = {};
        }
        return [
            {
                name: "server",
                type: "input",
                default: userConfig.server,
                required: true,
                message: "示例: http://10.20.30.19:8070/api/index.php",
                alias: "API调用地址",
            },
            {
                name: "token",
                type: "input",
                default: userConfig.token,
                required: true,
                message: "认证 token 信息",
                alias: "调用Token",
            },
        ];
    };
    // 上传图片
    const uploader = {
        config,
        handle: async (ctx) => {
            let userConfig = ctx.getConfig("picBed." + UPLOADER);
            if (!userConfig) {
                throw new Error("Can't find uploader config");
            }
            const imgList = ctx.output;
            for (let i in imgList) {
                const img = imgList[i];
                const { base64Image, fileName } = img;
                let { buffer } = img;
                if (!buffer && base64Image) {
                    buffer = Buffer.from(img.base64Image, "base64");
                }

                // 随机生成边界
                const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2, 10);

                // 构造 multipart/form-data 内容
                let reqBodyParts = [];

                reqBodyParts.push(Buffer.from(`--${boundary}\r\n`));
                reqBodyParts.push(Buffer.from(`Content-Disposition: form-data; name="token"\r\n\r\n`));
                reqBodyParts.push(Buffer.from(`${userConfig.token}\r\n`));

                reqBodyParts.push(Buffer.from(`--${boundary}\r\n`));
                reqBodyParts.push(Buffer.from(`Content-Disposition: form-data; name="image"; filename="${fileName}"\r\n`));
                reqBodyParts.push(Buffer.from(`Content-Type: image/png\r\n\r\n`));
                reqBodyParts.push(buffer);
                 reqBodyParts.push(Buffer.from(`\r\n`));

                // 计算 Content-Length
                reqBodyParts.push(Buffer.from(`--${boundary}--\r\n`));
                const reqBody = Buffer.concat(reqBodyParts);

                const requestConfig = {
                    url: userConfig.server,
                    method: "POST",
                    headers: { 
                        "Content-Type": `multipart/form-data; boundary=${boundary}`,
                        "User-Agent": "PicGo-easyimage",
                        "Content-Length": reqBody.length,
                    },
                    body: reqBody,
                };
                let body = await ctx.Request.request(requestConfig);
                body = JSON.parse(body);
                const { url: imgUrl, message } = body;
                if (imgUrl) {
                    img.imgUrl = imgUrl;
                }
                else {
                    ctx.emit("notification", {
                        title: "上传失败",
                        body: message,
                    });
                }
            }
            return ctx;
        },
    };
    const register = () => {
        ctx.helper.uploader.register(UPLOADER, uploader);
    };
    return {
        register,
        config,
        uploader: UPLOADER,
    };
};

```
