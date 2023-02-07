var config = {
    appName: "支付宝",
    antForestUrl: 'alipays://platformapi/startapp?appId=60000002',
    imgPath: {
        findEnergyImgPath: "./find.jpg",
        collectEnergyImgPath: "./g.jpg"
    },
    text: {
        homeText: "蚂蚁森林",
        friendText: "的蚂蚁森林",
        endText: "共找到能量",
        loadingText: "稍等片刻",

        energyRainCollectText: "去收取",
        energyRainBeginText: "立即开启",
        energyRainReadyText: "剩余时间|已拯救能量",
        energyRainEndText: /恭喜获得|今日累计获取|天天能量雨已完成/,
    },
    color: {
        energyColor: '#DEFF00'
    },
    pointPadding: {
        x: 1.0,
        y: 1.0
    },
}

var _ = {
    /**
     * 启动程序
     */
    start() {
        this.launchApp().wait(1000).ensureCaptPermission().wait(100)
        do {
            this.collectEnergy().findEnergy()
        } while (!this.isEnd())
        log("收集能量完成")

        // 收集能量雨
        if(tool.existText(config.text.energyRainCollectText)){
            this.openEnergyRain().collectEnergyRain()
            log("收集能量雨完成")
        }
       
        return this
    },
    /**
     * 打开蚂蚁森林
     */
    launchApp() {
        // 1. 打开应用
        launchApp(config.appName)

        // 2. 检查应用是否打开
        App.ALIPAY.ensureInstalled();

        // 3. 打开蚂蚁森林
        app.startActivity({
            data: config.antForestUrl,
            packageName: App.ALIPAY.getPackageName()
        })
        toastLog('打开蚂蚁森林成功')
        return this;
    },
    wait(t) {
        tool.wait(t)
        return this;
    },
    /**
     * 确认截图权限
     * 
     * @returns 
     */
    ensureCaptPermission() {
        try {
            if (images.requestScreenCapture()) {
                toastLog('请求截图权限成功')
                return this;
            }
        } catch (e) {
            log(e);
        }
        exit();
    },
    /**
     * 是否结束
     */
    isEnd() {
        return tool.existText(config.text.endText)
    },
    /**
     * 点击找能量
     */
    findEnergy() {
        if (tool.waitReadyByText(config.text.homeText)) {
            var point = tool.findImgPoint(config.imgPath.findEnergyImgPath)
            if (point) {
                log('找能量坐标:' + point)
                // 点击找能量
                tool.click(point.x, point.y)
            }
        }
        return this;
    },
    /**
     * 收集能量
     */
    collectEnergyByImg() {
        if (tool.waitReadyByText(config.text.homeText, config.text.loadingText)) {
            //截图
            var img = captureScreen();
            //images.save(img,"/sdcard/脚本/First/11.jpg","jpg",90)
            var template = images.read(config.imgPath.collectEnergyImgPath);
            var result = images.matchTemplate(img, template, {
                max: 100
            });
            result.matches.forEach(match => {
                log("point = " + match.point + ", similarity = " + match.similarity);
                tool.wait(100)
                tool.click(match.point.x, match.point.y - 10)
            });
            template.recycle()
        }
        return this;
    },
    /**
     * 收集能量
     */
    collectEnergy() {
        if (tool.waitReadyByText(config.text.homeText, config.text.loadingText)) {
            while (true) {
                tool.wait(100)
                var img = captureScreen();
                //,images.save(img,"/sdcard/脚本/First/11.jpg","jpg",90)

                var p = images.findMultiColors(img, config.color.energyColor, [
                    [0, 2, config.color.energyColor],
                    [2, 2, config.color.energyColor]
                ], {
                    threshold: 0.9
                });

                if (p) {
                    log("能量坐标:" + p)
                    tool.click(p.x, p.y)
                } else {
                    break
                }
            }
        }
        return this;
    },
    /**
     * 打开能量雨
     */
    openEnergyRain() {
        var p = tool.pickupText(config.text.energyRainCollectText)
        log("打开能量雨" + p)
        if (p && p instanceof UiObject) {
            tool.click(p.centerX(), p.centerY())
            if (tool.waitReadyByText(config.text.energyRainBeginText)) {
                p = tool.pickupText(config.text.energyRainBeginText)
                log("开始收集" + p)
                if (p && p instanceof UiObject) {
                    tool.click(p.centerX(), p.centerY())
                }
            }
        }
        return this
    },
    /**
     * 收集能量雨
     */
    collectEnergyRain() {
        if (!tool.existText(config.text.energyRainEndText)
            && tool.waitReadyByText(config.text.energyRainReadyText)) {
            while (true) {
                tool.wait(50)
                var img = captureScreen();
                //images.save(img,"/sdcard/脚本/First/11.jpg","jpg",90)

                var pts = images.findAllPointsForColor(img, config.color.energyColor, {
                    threshold: 0,
                    // region:[610.0, 609.0,]
                });

                if (pts && pts.length > 0) {
                    var p = pts[pts.length - 1]
                    log("能量雨坐标:" + p)
                    tool.click(p.x, p.y, 'p')
                }
                if (tool.existText(config.text.energyRainEndText)) {
                    break
                }
            }
        }
        return this
    },
}

var tool = {
    /**
     * 等待指定文本的界面加载完成
     * @param {*} text 
     * @param {许排除的文本} excludeText 
     * @returns 
     */
    waitReadyByText(text, excludeText) {
        while (true) {
            this.wait(100)
            if (this.existText(text)) {
                if (excludeText && this.existText(excludeText)) {
                    // 继续等待
                    continue
                }
                return true
            }
        }
        return false
    },
    /**
     * 等待指定图片的界面加载完成，并返回对应坐标
     * 
     * @param {待查找图片} findImgPath 
     * @returns 
     */
    waitReadyAndFindImg(findImgPath) {
        // 读取待查找图片
        var template = images.read(findImgPath);
        if (!template) {
            log("未找到待查图片:" + findImgPath)
            return
        }
        while (true) {
            //截图
            var img = captureScreen();
            //images.save(img,"/sdcard/脚本/First/11.jpg","jpg",90)
            var point = findImage(img, template);
            if (point) {
                template.recycle()
                return point;
            }
            this.wait(100)
        }
    },
    /**
     * 判断文本是否存在
     * 
     * @param {*} text 
     * @returns 
     */
    existText(text) {
        var result = this.pickupText(text);
        if (result) {
            return true
        }
        return false
    },
    /**
     * 根据文本模糊匹配，获取UiObject
     * 
     * @param {*} text 
     * @returns  UiObject
     */
    pickupText(text) {
        return pickup(text) || pickup(textContains(text));
    },
    /**
     * 查找图片坐标
     * 
     * @param {*} imgPath 
     * @returns 
     */
    findImgPoint(imgPath) {
        var template = images.read(imgPath);
        if (!template) {
            return
        }
        //截图
        var img = captureScreen();
        // images.save(img,"/sdcard/脚本/First/11.jpg","jpg",90)
        var point = findImage(img, template);
        template.recycle()
        return point
    },
    /**
     * 点击事件
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} type 
     */
    click(x, y, type) {
        if (type && type.match(/^p(ress)?$/)) {
            press(x + config.pointPadding.x, y + config.pointPadding.y, 50)
        } else {
            click(x + config.pointPadding.x, y + config.pointPadding.y);
        }
    },
    /**
     * 等待
     * @param {时间（毫秒）} t 
     */
    wait(t) {
        sleep(t)
    },
}

// 执行程序
_.start()