---
categories:
- 默认分类
date: '2024-12-29T10:35:00'
description: ''
draft: false
image: ''
slug: appveyor-build
tags:
- github
title: Appveyor自动化构建github项目
cover: /archives/appveyor-build/image-dgpf.png
---

需要在构建的仓库目录下提供 appveyor.yml 的配置文件

windows 平台提供的构建软件列表参考： [https://www.appveyor.com/docs/windows-images-software/](https://www.appveyor.com/docs/windows-images-software/)

MacOS 和 Linux 平台的可以点击对应的标签查看其提供的构建软件列表

![](/archives/appveyor-build/image-dgpf.png)

[https://www.appveyor.com/updates/2022/04/02/](https://www.appveyor.com/updates/2022/04/02/)

[https://www.appveyor.com/updates/2022/04/03/](https://www.appveyor.com/updates/2022/04/03/)

查看更新日志显示，Qt 5.14.2 已经被 remove 了，当前可用的 qt 版本 [https://www.appveyor.com/docs/windows-images-software/#qt](https://www.appveyor.com/docs/windows-images-software/#qt)

![](/archives/appveyor-build/image-qeht.png)

5.14.2 版本被 remove 了，但是 5.13.2 还保留着，后面几个字段分别是 2013, 2015, 2017, 2019, 2022 版本的支持情况

![](/archives/appveyor-build/image-olex.png)

**deploy发布到github**

官方提供的参考配置 [https://www.appveyor.com/docs/appveyor-yml](https://www.appveyor.com/docs/appveyor-yml)

官方发布的指导文档 [https://www.appveyor.com/docs/deployment/github/](https://www.appveyor.com/docs/deployment/github/)

需要触发打包发布到时候，执行 `git tag v1.4.1`，然后 `git push origin v1.4.1` 将 tag 推送到 github

增加 `skip_non_tags` 配置，在非 tag 提交到时候是否需要编译，如果本地编译没问题后，可以设为 true

```shell
skip_non_tags: true

deploy:
  release: myproduct-v$(APPVEYOR_BUILD_VERSION)
  description: 'Release description'
  provider: GitHub
  auth_token:
    secure: <your encrypted token> # your encrypted token from GitHub
  artifact: /.*\.nupkg/            # upload all NuGet packages to release assets
  draft: false
  prerelease: false
  on:
    branch: master                 # release from master branch only
    APPVEYOR_REPO_TAG: true        # deploy on tag push only
```
