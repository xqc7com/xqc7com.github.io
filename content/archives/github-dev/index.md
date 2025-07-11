---
categories:
- 默认分类
date: '2025-02-15T10:28:20'
description: ''
draft: false
image: ''
slug: github-dev
tags:
- git
- github
title: git开发流程以及github社区企业版
cover: /archives/github-dev/fkylnr.png
---

## 常规开发流程

1、将仓库 clone 到本地，已经 clone 的要 fetch & pull，保证本地 master 分支已经更新到最新状态

2、在 master 最新分支的基础上 checkout 一个开发分支，分支命名要求规范，如带用户名、日期、bug id 等关键信息 

这里假定命名为 dev，操作命令为 `git checkout -b dev`

3、在 dev 分支上进行开发以及自测，并提交 Merge Request ，经组内人员 review 没问题后进入 QA 测试环节

4、测试过程发现的 bug fix 代码提交到 dev 分支上，经 QA 回归后进入待发布环节

在开始从 master checkout 出来 dev 分支的时间，到 dev 通过 QA 验收待发布期间，master 分支可能已经多次 merge 了其他同事的开发分支

因此，在待发布环节，需要将最新的 master 合并到自己的 dev 开发分支上 `git merge master`

5、待发布环节 merge 主干的最新代码后，如果有冲突需要首先解决冲突，并评估冲突对当前版本的影响，决定是否需要重新进行 QA 测试

6、在已经 merge 了最新代码的 dev 分支下，编译版本，安排灰度上线，观察线上业务是否正常（不正常需要回退线上版本）

7、发布完毕，告知 leader 将 dev 开发分支合并入 master

8、leader 合并 dev 分支到 master 分支，至此一个迭代版本的阶段开发完毕


## 社区版和企业版

在 github 上建立两个仓库，一个 public 仓库作为社区版本，一个 private 仓库作为企业版本

这两个仓库可以是基于同一个账户的，也可以是不同账户的两个仓库，如仓库名分别为 test-community 和 test-enterprise

在本地建立一个代码仓库 test，并添加两个远端 community 和 enterprise 分别指向两个不同的仓库

![](/archives/github-dev/fkylnr.png)

本地仓库建立两个分支，如 community-dev 和 enterprise-dev，根据开发建立子分支进行开发

开发完毕后合并入对应的版本分支

在发布到 github 的时候，push 分别指定远端和分支名

如 community 指示的是远端仓库 `https://github.com/qc7even/test-community.git`，community-dev 是分支名

![](/archives/github-dev/gmzlxl.png)


## 配置用户信息

`git config --global user.name "user"` 设置用户名

`git config --global user.email "admin@abc.com"` 设置邮箱

`git config --global --list` 查看全局的所有配置

`git config --list` 查看当前仓库的所有配置

```conf
user.name=user
user.email=admin@abc.com
credential.helper=store
core.pager=cat
core.editor=vim
core.excludesfile=/Users/admin/.gitignore_global
pager.branch=false
pager.log=less -XFR
filter.lfs.clean=git-lfs clean -- %f
filter.lfs.smudge=git-lfs smudge -- %f
filter.lfs.process=git-lfs filter-process
filter.lfs.required=true
```

`git config --global credential.helper store` 设置本地保存密码，也可以走ssh（本地生成公私钥，并将公钥保存到服务端）


## 分支管理/维护

`git clone https://github.com/torvalds/linux.git` 仓库克隆

`git branch` 查看当前分支情况

`git branch -r` 查看远端分支

`git fetch orgin` 取回远端所有分支的更新，也可以 `git fetch`

`git fetch origin master` 取回远端master分支的更新

`git checkout -b v3.10 origin/v3.10` 将本地分支切换到 v3.10，该分支是从远端同步来的

`git diff` 查看当前分支的所有修改记录

`git diff src/rpc/main.cpp` 查看指定文件的修改记录

`git status` 查看当前分支的修改状况

`git add src/rpc/main.cpp` 添加修改文件到暂存区，也可以一次性全部添加 git add . 和 git add *

`git restore --staged src/rpc/main.cpp` 撤销前面对文件的add操作

`git commit -m "first commit"` 将暂存区的修改提交到本地分支

`git reset --hard 0404ba 将 commit` 点回退到0404ba ，这会导致比该提交点新的提交可能会丢失（1.没push；2.没记住id）

`git reset --soft HEAD^ commit` 之后没有push，如果想撤销 commit 可以使用这个命令 ，只是回退 commit ，修改的内容还在

`git checkout db/src/main.cpp` 恢复文件为原始的版本

`git checkout .` 本地所有修改的，没有提交的，都恢复到原来的状态

`git reset dc5a6e53 db/src/main.cpp` 恢复文件为某个指定的版本

`git push origin dev` 推送本地分支到远端

`git push origin dev -f` 推送本地分支到远端，并强制覆盖远端分支

`git statsh`

现在需要在 branch1 上做开发，但是因为中间分析问题等其他原因，需要将源码分支切换回 master

后面忘记了当前在 master 分支，没及时切回 branch1，就在 master 分支上编写代码了，准备commit的时候才发现当前编辑分支是 master

使用 git stash将 master 分支上的编辑暂存，切换到 branch1 分支，然后 git stash pop 弹出刚编辑的代码，再行commit

通常 stash 会忽略那些没有被 track 的文件，可以加上参数 -u，如 git stash -u

`git reset --hard` 放弃本次的所有修改

`git clean -xdf` 删除当前工作区的所有untracked files 　

```shell
x --- Don't use the standard ignore rules read from .gitignore 　
f --- force 　
d --- Remove untracked directories in addition to untracked files
```

`git branch -d xxx` 删除 xxx 分支，这是本地删除

`git push --delete origin`删除远程分支

有时候删除远程分支的时候提示 error: unable to delete : remote ref does not exist

因为别人 merge 的时候已经删除了该分支，所以需要更新本地 cache ，使用 -p 选项 `git fetch -p origin`

`git merge master` 合并 master 分支到当前分支，需要合并的分支应更新到最新状态，如冲突需要手动解决

## 常用的git命令

`git remote remove origin`

`git remote add origin https://github.com/user/linux.git`

断开与远程仓库的连接，并建立新的远程仓库连接，常见情况：比如将一个 github 上别人的仓库，push 到个人的仓库上（不是 fork）

`git branch --set-upstream-to=origin/dev 设置跟踪的分支`

`git branch --unset-upstream dev` 取消对 dev 的跟踪

`git branch -v` 查看本地分支对应的远端分支关系

`git config --list` 查看本地分支对应的远端分支关系

`git log -p ./db/src/main.cpp` 查看文件的修改历史

`git log dev ^master` 查看dev分支有而master分支没有的

`git log master..dev` 查看dev分支比master分支多的提交

`git commit --amend` 对上一次commit的修正

`git commit --amen` 更新注释

`git log --name-only` 查看每次提交的文件

`git log --name-status` 查看每次提交的文件(是新增，修改，还是删除)

`git log db/src/main.cpp` 查看文件的所有提交

`git log db/src/main.cpp` 查看文件的所有提交的详细修改

`git blame db/src/main.cpp` 查看文件每一行是哪个提交修改的

`git show commitid` 查看该次提交的修改

`git blame filename` 显示文件的每一行代码的提交信息
