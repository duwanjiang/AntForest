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

module.exports = tool;