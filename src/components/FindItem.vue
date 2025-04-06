<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import FindItemCopyConfig from "./FindItem-CopyConfig.vue";

defineProps({
  msg: String,
});

// 设置参数
const company_name = ref(GM_getValue("company_name", "点击设置公司名"));

// 因html模板内无法访问油猴api，所以用watch方法同步参数
watch(company_name, () => {
  GM_setValue("company_name", company_name.value);
});
// company_name值保持
if (GM_getValue("company_name", "").length == 0) {
  GM_setValue("company_name", "点击设置公司名");
  company_name.value = GM_getValue("company_name", "点击设置公司名");
}

// 加载字符图标
async function loadStyles(url) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = url;
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(link);
}
loadStyles(
  "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons"
);

const count = ref(0);
const $q = useQuasar();

function getPage() {
  let url = window.location.href;
  let urlStr = url.split("?")[1];
  const urlSearchParams = new URLSearchParams(urlStr);
  const result = Object.fromEntries(urlSearchParams.entries());
  var page = 1;
  if ("page" in result) {
    page = result.page;
  }
  return page;
}

// 在搜索页查找公司自然坑位产品并复制相关信息
function find_myitem() {
  // 产品信息
  var item_info = []; // 回传的产品信息
  var item = {
    rank: undefined,
    product_id: undefined,
    item_url: undefined,
    img_url: undefined,
    title: undefined,
    page: 0,
  };
  // 本店名称
  var mycompany = company_name.value;
  // 全部商品卡片，未包括顶展和问鼎
  var allcard = document.querySelectorAll(
    "div.app-organic-search__main-body div.fy23-search-card"
  );
  // Main
  let found = 0; // 判断变量：防止出现大数据杀熟而使得结果出现好几个进而影响后续的流程
  allcard.forEach(function (element, index) {
    item.page = getPage();

    item.product_id = element.getAttribute("data-ctrdot");

    // 遍历中当前产品的公司名
    var company = element.querySelector("a.search-card-e-company").innerText;
    item.item_url =
      "https:" +
      element
        .querySelector("a[target='_blank'][href][data-spm='d_title']")
        .getAttribute("href");

    var ad = element.getAttribute("data-spm") == "normal_offer" ? 0 : 1;
    item.rank = index + 1;

    var title = element.querySelector("h2.search-card-e-title").innerText;
    item.title = title;

    item.img_url =
      "https:" +
      element
        .querySelector("div.search-card-m-imgarea img")
        .getAttribute("src");

    //SEO坑位自然排名	产品ID	产品图（链接）	是否放橱窗
    var res = [item.rank, item.product_id, item.item_url].join("\t");

    if (!ad && company == mycompany&& !found) {
      found = 1; // 控制结果只有一个自然排名商品的数据
      element.style.backgroundColor = "beige";
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
      // GM_setClipboard(res);
      // 复制搜到的产品信息并传到FindItem-CopyConfig
      item_info.push({
        name: "page",
        label: "页数",
        val: item.page,
      });
      item_info.push({
        name: "product_id",
        label: "产品ID",
        val: item.product_id,
      });
      item_info.push({
        name: "item_url",
        label: "产品链接",
        val: item.item_url,
      });
      item_info.push({
        name: "rank",
        label: "自然排名",
        val: item.rank,
      });
      item_info.push({
        name: "title",
        label: "标题",
        val: item.title,
      });

      item_info.push({
        name: "img_url",
        label: "图片链接",
        val: item.img_url,
      });
      var _item = {};
      Object.assign(_item, item);
      item_info.push(_item);
    }
  });

  return item_info;
}

// 最终用的商品信息
var item_info = ref([]);

function showNotif() {
  var _item_info =
    find_myitem().length > 1 ? find_myitem().pop() : find_myitem();

  const notify_temp = _item_info.product_id
    ? `<table id='my-item'>
    <thead>
    <tr>
      <th scope="col">页数</th>
      <th scope="col">产品图片</th>
      <th scope="col">自然排名</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">${_item_info.page}</th>
      <td><img src="${_item_info.img_url}" style="height:50px;"></td>
      <td>${_item_info.rank}</td>
    </tr>
  </tbody>
</table>
产品信息已复制到剪贴板
`
    : `第${getPage()}页未发现产品`;
  company_name.value = GM_getValue("company_name", "");
  $q.notify({
    type: "info",
    message: notify_temp,
    html: true,
    color: "primary",
    progress: true,
    position: "top-right",
    actions: [
      {
        icon: "close",
        color: "white",
        round: true,
        handler: () => {
          /* ... */
        },
      },
    ],
  });
  // 重置回传数据值，之前的_item_info只取最后一项用于展示通知
  _item_info = find_myitem();
  _item_info.pop();

  item_info.value = _item_info;
  return _item_info;
}

// 加载完成的第一次运行，用监控搜索区商品卡片是否出现的方法
// 选择需要观察变动的节点
const targetNode = document.querySelector("div.app-organic-search__main-body");

// 观察器的配置（需要观察什么变动）
const config = { attributes: true, childList: true, subtree: true };

// 当观察到变动时执行的回调函数
const callback = function (mutationsList, observer) {
  const condition = document.querySelectorAll(
    "div.app-organic-search__main-body div.fy23-search-card"
  );
  if (condition.length >= 20) {
    // 之后，可停止观察
    observer.disconnect();
    item_info.value = showNotif();
  }
};

// 创建一个观察器实例并传入回调函数
const observer = new MutationObserver(callback);

// 以上述配置开始观察目标节点
observer.observe(targetNode, config);

// 添加通知里表格样式
const my_item_css = document.createElement("style");
my_item_css.innerHTML = `#my-item {
  max-height: 100px;
  border-collapse: collapse;
  border: 2px solid rgb(140 140 140);
  font-family: sans-serif;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

#my-item caption {
  caption-side: bottom;
  padding: 10px;
  font-weight: bold;
}

#my-item th,
td {
  border: 1px solid rgb(160 160 160);
  padding: 8px 10px;
}

#my-item td:last-of-type {
  text-align: center;
}

#my-item tbody > tr:nth-of-type(even) {
  background-color: rgb(237 238 242);
}

#my-item tfoot th {
  text-align: right;
}

#my-item tfoot td {
  font-weight: bold;
}`;
document.body.append(my_item_css);
</script>

<template>
  <!--产品信息复制设置-->
  <FindItemCopyConfig v-bind:itemInfo="item_info"></FindItemCopyConfig>

  <q-btn
    color="primary"
    push
    icon="track_changes"
    label="查找"
    @click="showNotif"
  />
  <h1>{{ msg }}</h1>
  <div
    class="cursor-pointer"
    style="
      max-width: 50%;
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
    "
  >
    {{ company_name }}
    <q-popup-edit
      v-model="company_name"
      auto-save
      buttons
      label-set="保存"
      label-cancel="取消"
      v-slot="scope"
      style="z-index: 10000"
    >
      <q-input
        v-model="scope.value"
        dense
        autofocus
        counter
        @keyup.enter="
          scope.set;
          company_name = scope.value;
        "
      />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
