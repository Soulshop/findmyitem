<template>
  <q-btn padding="xs" push color="primary" icon="settings"
    ><!--产品信息复制设置窗口-->
    <q-popup-proxy style="z-index: 10000">
      <span style="display: none">{{ itemInfo }}</span>

      <q-banner>
        <draggable
          :list="list"
          :disabled="!enabled"
          item-key="id"
          class="list-group column inline no-wrap"
          ghost-class="ghost"
          :move="checkMove"
          @start="dragging = true"
          @end="
            dragging = false;
            endHandle();
          "
        >
          <template #item="{ element, index }">
            <div
              class="list-group-item row inline no-wrap items-center"
              :class="{ 'not-draggable': !enabled }"
              :data-name="element.name"
              :data-index="index"
            >
              <q-icon name="unfold_more" />
              {{ element.label
              }}<span class="text-weight-bolder" style="padding: 0px 3px"
                >:</span
              >
              <span class="col-grow">{{ element.val }}</span>
              <q-checkbox
                v-model="copies"
                :val="element.name"
                :name="element.name"
                color="teal"
                @update:model-value="setCopies"
              />
            </div>
          </template>
        </draggable>
        <p>
          拖动以调整要复制信息的顺序（调整后会自动复制），勾选框确定是否复制该项。
        </p>
        <p style="padding: 5px 0px">
          <q-btn color="secondary" label="复制" @click="toClipboard" />
        </p>
      </q-banner>
    </q-popup-proxy>
  </q-btn>
</template>
  
<script>
import { ref, watch } from "vue";
import draggable from "vuedraggable";
import { GM_setValue, GM_getValue, GM_setClipboard } from "$monkey";

let id = 1;
export default {
  name: "simple",
  display: "Simple",
  order: 0,
  components: {
    draggable,
  },
  props: { itemInfo: Array },
  watch: {
    itemInfo: {
      handler(newVal) {
        // 如果copies复制项数组长度为零则初始化未全选
        const copies = []; // 用于确定哪些会被复制的数组
        newVal.forEach((e) => {
          copies.push(e.name);
        });
        if (this.copies.length == 0) {
          this.copies = copies;
          GM_setValue("copy_choose", this.copies);
        }

        // 更新已排序后数组的数据
        var old_data = GM_getValue("copy_data", []);
        var new_data = newVal;

        if (new_data.length != 0) {
          // 新数据不为空才更新旧数据
          old_data.forEach((e, i) => {
            const old_name = e.name;
            new_data.forEach((e2) => {
              const new_name = e2.name;

              if (old_name == new_name) {
                old_data[i].val = e2.val;
              }
            });
          });
        }
        // 如果原数据为空时则视为初始化
        if (old_data.length == 0) {
          old_data = new_data;
        }
        // 数据同步完后old_data就变成了"新数据"
        // 更新数据后同步到组件list
        GM_setValue("copy_data", old_data);
        this.list = GM_getValue("copy_data", []);

        this.toClipboard();
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      enabled: true,
      // 初始化列表
      list: GM_getValue("copy_data", ["无信息"]),
      dragging: false,
      copies: ref(GM_getValue("copy_choose", [])), // 要复制的信息项
    };
  },
  computed: {
    draggingInfo() {
      return this.dragging ? "under drag" : "";
    },
  },
  methods: {
    setCopies: function (value, evt) {
      GM_setValue("copy_choose", this.copies);
      this.toClipboard();
    },
    add: function () {
      this.list.push({ name: "Juan " + id, id: id++ });
    },
    replace: function () {
      this.list = [{ name: "Edgard", id: id++ }];
    },
    checkMove: function (e) {
      window.console.log("Future index: " + e.draggedContext.futureIndex);
    },
    setIndex: function () {
      // 设置复制数组的序号
      const index_old = GM_getValue("copy_index");
      const index_new = null;
    },
    endHandle: function () {
      GM_setValue("copy_data", this.list);
      this.toClipboard();
    },
    toClipboard: function () {
      var res = [];
      // 先将要复制的值放入数组以便组成复制文本
      const copies = [];
      this.copies.forEach((e) => {
        copies.push(e);
      });
      this.list.forEach((e) => {
        if (copies.includes(e.name)) {
          res.push(e.val);
        }
      });
      res = res.join("\t");
      GM_setClipboard(res);
    },
  },
  mounted: function () {
    console.log(this.itemInfo);
  },
};
</script>

<style>
.not-draggable {
  cursor: no-drop;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group-item {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 10px 30px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: nowrap;
  position: relative;
}
</style>