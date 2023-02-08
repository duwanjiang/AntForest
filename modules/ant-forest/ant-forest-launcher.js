let tool = require('../../tools/tool');

let config = {
    appName: "支付宝",
    antForestUrl: 'alipays://platformapi/startapp?appId=60000002',
    imgPath: {
        // 根据main.js的相对路径
        findEnergyImgPath: "./res/ant-forest/img/find.jpg",
        collectEnergyImgPath: "./res/ant-forest/img/g.jpg",
        rainingImgPath: "./res/ant-forest/img/raining.jpg",
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
}

var _ = {
    /**
     * 启动程序
     */
    start() {
        this.launchApp().wait(1000).ensureCaptPermission().wait(100)
        this.monitor()
        do {
            sleep(100)
            if (this.flag.energy.start && !this.flag.energy.end) {
                this.collectEnergy().wait(1000).findEnergy()
            }
            if (this.flag.energyRain.open) {
                this.openEnergyRain()
            }
            if (this.flag.energyRain.start) {
                this.startEnergyRain()
            }
            if (this.flag.energyRain.raining) {
                this.collectEnergyRain()
            }
        } while (!this.flag.end)
        threads.shutDownAll();
        toastLog("收集能量完成")
    },
    flag: {
        end: false,
        energy: {
            start: false,
            end: false
        },
        energyRain: {
            open: false,
            start: false,
            raining: false,
            end: false
        }
    },
    flagReset() {
        this.flag = {}
        this.flag.end = false
        this.flag.energy = {}
        this.flag.energy.start = false
        this.flag.energy.end = false
        this.flag.energyRain = {}
        this.flag.energyRain.open = false
        this.flag.energyRain.start = false
        this.flag.energyRain.raining = false
        this.flag.energyRain.end = false
    },
    /**
     * 监控页面状态
     */
    monitor() {
        threads.start(() => {
            while (!_.flag.end) {
                _.flagReset()
                let flag = false
                let wc = contentMatch(/.+/).find()
                if (wc && wc.length > 0) {
                    if (wc.toArray()[0].packageName() != App.ALIPAY.getPackageName()) {
                        // 当前不在支付宝页面
                        continue
                    }
                }
                if (!flag && tool.existText(config.text.endText) && !tool.existText(config.loadingText)) {
                    _.flag.energy.end = true
                    if(tool.existText(config.text.energyRainEndText)){
                        _.flag.end = true
                    }
                    flag = true
                }
                if (!flag && tool.existText(config.text.homeText) && !tool.existText(config.loadingText)) {
                    _.flag.energy.start = true
                    flag = true
                }
                if (!flag && tool.existText(config.text.energyRainBeginText) && !tool.existText(config.loadingText)) {
                    _.flag.energyRain.start = true
                    flag = true
                }
                if (!flag && tool.existText(config.text.energyRainCollectText) && !tool.existText(config.loadingText)) {
                    _.flag.energyRain.open = true
                    flag = true
                }
                if (!flag && tool.existText(config.text.energyRainEndText) && !tool.existText(config.loadingText)) {
                    _.flag.energyRain.end = true
                    _.flag.end = true
                    flag = true
                }
                if (!flag && tool.findImgPoint(config.imgPath.rainingImgPath)) {
                    _.flag.energyRain.raining = true
                    flag = true
                }
                if(flag){
                    log(_.flag)
                }
                sleep(100)
            }
        });
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
    * 点击找能量
    */
    findEnergy() {
        var point = tool.findImgPoint(config.imgPath.findEnergyImgPath)
        if (point) {
            log('找能量坐标:' + point)
            // 点击找能量
            tool.click(point.x, point.y)
        }
        return this;
    },
    /**
    * 收集能量
    */
    collectEnergy() {
        while(!this.flag.energy.end){
            var img = captureScreen();
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
        return this;
    },
    /**
     * 打开能量雨
     */
    openEnergyRain() {
        let p = tool.pickupText(config.text.energyRainCollectText)
        log("打开能量雨")
        if (p && p instanceof UiObject) {
            tool.click(p.centerX(), p.centerY())
        }
        return this
    },
    startEnergyRain() {
        let p = tool.pickupText(config.text.energyRainBeginText)
        log("开始收集")
        if (p && p instanceof UiObject) {
            tool.click(p.centerX(), p.centerY())
        }
        return this
    },
    /**
     * 收集能量雨
     */
    collectEnergyRain() {
        while (!this.flag.energyRain.end) {
            //tool.wait(50)
            var img = captureScreen();

            var pts = images.findAllPointsForColor(img, config.color.energyColor, {
                threshold: 0,
                // region:[610.0, 609.0,]
            });

            if (pts && pts.length > 0) {
                var p = pts[pts.length - 1]
                tool.click(p.x, p.y, 'p')
                //images.save(img, "/sdcard/脚本/First/" + p.x+ "-"+ p.y+".jpg", "jpg", 90)
                log("能量雨坐标:" + p)
                tool.click(p.x, p.y + 120, 'p')
            }
        }
        return this
    },
}


module.exports = _