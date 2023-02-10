let tool = require('../../tools/tool');

let config = {
    appName: "支付宝",
    antForestUrl: 'alipays://platformapi/startapp?appId=60000002',
    imgPath: {
        findEnergyImgPath: "./res/ant-forest/img/find.jpg",
        collectEnergyImgPath: "./res/ant-forest/img/g.jpg",
        rainingImgPath: "./res/ant-forest/img/raining.jpg",
    },
    text: {
        homeText: "蚂蚁森林",
        friendText: /去保护|的蚂蚁森林/,
        endText: "共找到能量",
        loadingText: "稍等片刻",

        energyRainCollectText: "去收取",
        energyRainBeginText: /立即开启|再来一次/,
        energyRainReadyText: "剩余时间|已拯救能量",
        energyRainSendText: "送TA机会",
        energyRainEndText: /恭喜获得|今日累计获取|天天能量雨已完成/,
    },
    color: {
        energyColor: '#DEFF00',
        energyDoubleColor: '#DEFF02',
        energyRainColor: '#DAFF00'
    },
    region: function $iiFe() {
        let [l, t, r, b] = [cX(0.1), cYx(0.16), cX(0.9), cYx(0.36)];
        return [l, t, r - l, b - t];
    }(),
}

var _ = {
    /**
     * 启动程序
     */
    start() {
        this.launchApp().wait(1000).ensureCaptPermission().wait(100)
        this.monitor()
        do {
            if (this.flag.energy.start && !this.flag.energy.end) {
                this.collectEnergy().findEnergy()
            }
            if (this.flag.energyRain.open) {
                this.openEnergyRain()
            }
            if (this.flag.energyRain.start) {
                this.startEnergyRain().wait(3000).collectEnergyRain()
            }
            if (this.flag.energyRain.send) {
                toastLog("等待送好友机会，并继续收取能量！")
                this.wait(2000)
            }
            sleep(1000)
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
            send: false,
            end: false
        }
    },
    flagReset() {
        this.flag = {
            end: false,
            energy: {
                start: false,
                end: false
            },
            energyRain: {
                open: false,
                start: false,
                send: false,
                end: false
            }
        }
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
                    if (tool.existText(config.text.energyRainEndText) &&
                        !tool.existText(config.text.energyRainSendText)) {
                        _.flag.end = true
                    }
                    flag = true
                }
                if (!flag && tool.existText(config.text.homeText) &&
                    tool.existText(config.text.friendText) && !tool.existText(config.loadingText)) {
                    _.flag.energy.start = true
                    flag = true
                }
                if (!flag && tool.existText(config.text.energyRainBeginText) &&
                    !tool.existText(config.text.energyRainEndText) && !tool.existText(config.loadingText)) {
                    _.flag.energyRain.start = true
                    flag = true
                }
                if (tool.existText(config.text.energyRainCollectText) && !tool.existText(config.loadingText)) {
                    _.flag.energyRain.open = true
                    flag = true
                }
                if (!flag && tool.existText(config.text.energyRainEndText) && !tool.existText(config.loadingText)) {
                    _.flag.energyRain.end = true
                    if (tool.existText(config.text.energyRainSendText)) {
                        _.flag.energyRain.send = true
                    } else if (tool.existText(config.text.energyRainBeginText)) {
                        _.flag.energyRain.start = true
                    } else {
                        _.flag.end = true
                    }
                    flag = true
                }
                sleep(500)
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
            tool.click(point.x, point.y, 'p')
        }
        return this;
    },
    /**
     * 收集能量
     */
    collectEnergy() {
        while (!this.flag.energy.end) {
            var img = captureScreen();
            var p = this.findMultiColors(img, config.color.energyColor)
            if (p) {
                log("能量坐标:" + p)
                tool.click(p.x, p.y)
            } else {
                p = this.findMultiColors(img, config.color.energyDoubleColor)
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
    findMultiColors(img, color) {
        return images.findMultiColors(img, color, [
            [0, 0, color],
            [0, 0, color]
        ], {
            threshold: 0.9,
            //region: config.region
        });
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
            var img = captureScreen();
            var pts = images.findAllPointsForColor(img, config.color.energyRainColor, {
                threshold: 0,
                region: config.region
            });

            if (pts && pts.length > 0) {
                var p = pts[pts.length - 1]
                log("能量雨坐标:" + p)
                tool.click(p.x, p.y, 'p')
            }
        }
        return this
    },
}


module.exports = _
