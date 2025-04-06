import { createApp } from "vue";
import { Quasar, Notify } from "quasar";
// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
// Import Quasar css
import "quasar/dist/quasar.css";

import "./style.css";
import App from "./App.vue";

const myApp = createApp(App);

myApp.use(Quasar, {
  plugins: { Notify }, // import Quasar plugins and add here
});

// 避免挂载失败 在出现容器元素后再挂载
// 选择需要观察变动的节点
const targetNode = document.body;

// 观察器的配置（需要观察什么变动）
const config = { attributes: false, childList: true, subtree: true };

// 当观察到变动时执行的回调函数
const callback = function (mutationsList, observer) {
  const condition = document.querySelector("div#the-new-header div.tnh-main");
  if (Boolean(condition)) {
    // 之后，可停止观察
    observer.disconnect();
    myApp.mount(
      (() => {
        var box = document.querySelector("div#the-new-header div.tnh-main");
        var app = document.createElement("div");
        app.id = "alibabaTools";
        app.classList.add("flex", "flex-center", "column");
        box.append(app);
        return app;
      })()
    );
  }
};

// 创建一个观察器实例并传入回调函数
const observer = new MutationObserver(callback);

// 以上述配置开始观察目标节点
observer.observe(targetNode, config);
