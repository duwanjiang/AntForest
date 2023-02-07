let { tool } = require('../../tools/tool.js');

auto();
events.observeNotification();
events.onNotification(function (notification) {
    printNotification(notification);
});

function printNotification(notification) {
    log("应用包名: " + notification.getPackageName());
    log("通知文本: " + notification.getText());
    log("通知优先级: " + notification.priority);
    log("通知目录: " + notification.category);
    log("通知时间: " + new Date(notification.when));
    log("通知数: " + notification.number);
    log("通知摘要: " + notification.tickerText);
}

var config = {
    appName: "微信",
    text: {
        redPackgeText: /微信红包/
    }
}

var _ = {
    
}