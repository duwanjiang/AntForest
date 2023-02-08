'ui'
let antForest = require('./modules/ant-forest/ant-forest-launcher')
let redPackge = require('./modules/red-package/red-package-launcher')
try {
    var item = dialogs.singleChoice("请选择项目", ["蚂蚁森林", "微信红包"], 0);
    //toast("选择了第" + (item + 1) + "个选项");
    switch (item) {
        case 0:
            antForest.start()
            break
        case 1:
            redPackge.start()
            break
    }
} catch (e) {
    log(e)
}