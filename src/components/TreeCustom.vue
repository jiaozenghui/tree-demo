<template>
  <a-tree
    :show-line="showLine"
    :show-icon="showIcon"
    v-model:expandedKeys="expandedKeys"
    :tree-data="state.gData"
    draggable
    @drop="onDrop"
    @dragover="onDragOver"
    :fieldNames="{ children: 'children', title: 'title', key: 'key' }"
  />

  <div
    v-if="mergePopoverVisible"
    class="pop-div"
    :style="popoverStyle"
    placement="topLeft"
  >
    <span>{{ popMsg }}</span>
  </div>
</template>

<script setup lang="ts">
import {
  type CSSProperties,
  ref,
  type PropType,
  computed,
  reactive,
} from "vue";
import { message, Tree as ATree } from "ant-design-vue";
import type { AntTreeNodeDropEvent, TreeProps } from "ant-design-vue/es/tree";

type TreeDataItem = TreeProps["treeData"][] & {
  children?: Array<TreeDataItem>;
  key: string;
};

const props = defineProps({
  gData: {
    type: Array as PropType<TreeProps["treeData"]>,
    default: [],
  },
});

const state = reactive({
  gData: props.gData,
});
const mergePopoverVisible = ref(false);
const popoverStyle = ref<CSSProperties>({
  position: "fixed",
  left: "0",
  top: "0",
  zIndex: 9999,
});
const popMsg = ref("");
const Pos = ref("");
const dropNodeTitle = ref("");
const showLine = ref<boolean>(true);
const showIcon = ref<boolean>(false);

const expandedKeys = ref<string[]>(["0-0", "0-1"]);

//移动到最终节点
const onDrop = (info: AntTreeNodeDropEvent) => {
  mergePopoverVisible.value = false;
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info?.node?.pos?.split("-");
  const dropPosition =
    dropPos && info.dropPosition - Number(dropPos[dropPos?.length - 1]);

  const dragParent = findParent(state.gData, dragKey);
  const dropParent = findParent(state.gData, dropKey);

  if (dragParent?.key !== dropParent?.key) {
    // 如果不在同一层级，则不执行拖拽操作或给出提示
    message.error("不能跨层级拖拽");
    return; // 阻止默认行为，例如阻止重新排序或移动节点到其他父节点下
  }

  const loop = (
    data: TreeProps["treeData"],
    key: string | number,
    callback: any
  ) => {
    data &&
      data.forEach((item, index) => {
        if (item.key === key) {
          return callback(item, index, data);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
  };
  const data = [...(state.gData ? state.gData : [])];

  // Find dragObject
  let dragObj: TreeDataItem = <any>{};
  loop(
    data,
    dragKey,
    (item: TreeDataItem, index: number, arr: TreeProps["treeData"]) => {
      arr && arr.splice(index, 1);
      dragObj = item;
    }
  );
  if (!info.dropToGap) {
    // Drop on the content
    mergeNodes(dragObj.key, dropKey);
  } else if (
    (info.node.children || []).length > 0 && // Has children
    info.node.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    message.error("不能跨层级拖拽");
    return;
  } else {
    let ar: TreeProps["treeData"] = [];
    let i = 0;
    loop(
      data,
      dropKey,
      (_item: TreeDataItem, index: number, arr: TreeProps["treeData"]) => {
        ar = arr;
        i = index;
      }
    );
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj);
    } else {
      ar.splice(i + 1, 0, dragObj);
    }
  }
  state.gData = data;
};

//处理 Hover到节点之上的提示效果
const onDragOver = (info: any) => {
  let ele = document.getElementsByClassName(
    "ant-tree-drop-indicator"
  )[0] as HTMLElement;
  let rect: DOMRect;
  if (ele) {
    rect = ele.getBoundingClientRect();
    dropNodeTitle.value = info.node.title;

    Pos.value = parseInt(ele.style.top) < 0 ? "之上" : "之下";
    popMsg.value =
      parseInt(ele.style.left) === 28
        ? `将与【${dropNodeTitle.value}】合并`
        : `将置于【${dropNodeTitle.value}】${Pos.value}`;
    if (Pos.value) {
      popoverStyle.value = {
        position: "fixed",
        left: `${rect.left + 10}px`,
        top: `${rect.top}px`,
        zIndex: 9999,
      };
      mergePopoverVisible.value = true;
    } else {
      mergePopoverVisible.value = false;
    }
  } else {
    mergePopoverVisible.value = false;
  }
};

const mergeNodes = (sourceKey: string, targetKey: string | number) => {
  const data = [...(state.gData ? state.gData : [])];
  const sourceNode = findNode(data, sourceKey);
  const targetNode = findNode(data, targetKey);

  targetNode.title = `${targetNode.title} + ${sourceNode.title}`;

  // 如果目标节点有children，把源节点的children合并过去
  if (sourceNode.children && sourceNode.children.length > 0) {
    targetNode.children = [
      ...(targetNode.children || []),
      ...sourceNode.children,
    ];
  }
  //modifyNode(targetKey, targetNode.title, data);
  // 移除源节点
  removeNode(data, sourceKey);
  state.gData = data;
};
const findNode = (tree: any, key: any): any => {
  for (const node of tree) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNode(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

const findParent = (tree: any, key: any, parent = null): any => {
  for (const node of tree) {
    if (node.key === key) return parent;
    if (node.children) {
      const found = findParent(node.children, key, node);
      if (found) return found;
    }
  }
  return null;
};

const removeNode = (tree: any, key: any) => {
  const index = tree.findIndex((node: any) => node.key === key);
  if (index >= 0) {
    tree.splice(index, 1);
    return true;
  }
  for (const node of tree) {
    if (node.children && removeNode(node.children, key)) {
      return true;
    }
  }
  return false;
};
</script>
<style lang="less" scoped>
.pop-div {
  background-color: #1677ff;
  padding: 6px 10px;
  color: #fff;
  text-align: left;
  border-radius: 4px;
}
</style>
