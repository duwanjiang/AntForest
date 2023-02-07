<!--suppress HtmlDeprecatedAttribute -->

<div align="center">
   <p>
    <img alt="AF_Banner" src="https://raw.githubusercontent.com/SuperMonster002/Hello-Sockpuppet/master/ant-forest-banner_374%C3%97106.png"/>
  </p>
  <p>基于 Auto.js 的自动脚本项目</p>
  <p>Auto.js-based auto script project</p>
</div>

******

### 使用说明

******
1. 检查设备环境

- 操作系统: [Android 7.0](https://zh.wikipedia.org/wiki/Android_Nougat) (`API 24`) 及以上

2. 下载并安装 Auto.js

- [AutoJs6](https://github.com/SuperMonster003/AutoJs6/releases/latest) (`开源免费`)

> 自 v2.3.0 起将仅支持使用 AutoJs6 运行当前项目  
> 因项目运行依赖于 [Rhino 引擎](https://github.com/mozilla/rhino) 的部分 [新特性](https://github.com/SuperMonster003/AutoJs6/blob/master/app/src/main/assets/doc/RHINO.md) 及 AutoJs6 的部分新 API 及内置模块

3. 下载并部署项目 (任意一种方式)

- [下载项目部署工具](https://raw.githubusercontent.com/SuperMonster003/Ant-Forest/master/tools/ant-forest-deployment-tool.min.js) (`*.js`)
    1. 将部署工具 (脚本文件) `保存` 或 `另存为` 至本地存储
    2. 用 `AutoJs6` 直接运行 (或导入后运行) 脚本文件完成部署
    3. 部署后可能需要关闭并重启 `AutoJs6` 才能看到项目目录
- [下载最新项目数据包](https://github.com/SuperMonster003/Ant-Forest/archive/master.zip) (`*.zip`)
    1. 将项目数据包解压到本地存储
    2. 定位到设备的内部存储目录 如:  
       `/内部存储/` `/Internal Storage/` `/sdcard/` `/storage/emulated/0/` 等
    3. 在此目录下找到 `AutoJs6` 默认工作目录  
       · 中文系统默认目录 `./脚本/`  
       · 英文系统默认目录 `./Scripts/`
    4. 若不存在则需手动建立工作目录  
       或在 `AutoJs6` 软件中设置工作目录
    5. 将解压后的项目文件夹放置在工作目录中

> 项目支持更新版本的自动检查/提示/下载/版本忽略等相关功能

4. 使用 Auto.js 运行项目

- 运行 `main.js` 启动项目
