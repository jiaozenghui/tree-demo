<template>
  <div class="draggable-tree">
    <a-tree
      :show-line="showLine"
      :show-icon="showIcon"
      block-node
      v-model:expandedKeys="expandedKeys"
      :tree-data="state.gData"
      draggable
      @drop="onDrop"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      :fieldNames="{ children: 'children', title: 'title', key: 'key' }"
    >
      <template #title="{ key: treeKey, title }"
        ><span class="keytag" :idd="treeKey" :title="title">
          {{ title }}
        </span>
      </template>
    </a-tree>
  </div>

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
import { type CSSProperties, ref, type PropType, reactive, watch } from "vue";
import { message, Tree as ATree } from "ant-design-vue";
import type {
  AntTreeNodeDropEvent,
  DataNode,
  TreeProps,
  EventDataNode,
} from "ant-design-vue/es/tree";

type NodeDragEventParams = {
  event: DragEvent;
  node: EventDataNode;
};

type TreeDataItem = TreeProps["treeData"][] & {
  children?: Array<TreeDataItem>;
  key: keyType;
  expanded: boolean;
};

type keyType = string | number;

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

const showLine = ref<boolean>(true);
const showIcon = ref<boolean>(false);

const expandedKeys = ref<string[]>(["0-0", "0-1"]);

const popMsg = ref("");
const dragNode = ref<DataNode>();
const dropNodeKey = ref<keyType>("");
const IsNodeMerge = ref(false);

/**
 * 拖拽开始的时候记录拖动的节点
 * @param info 拖拽源节点Info
 */
const onDragStart = (info: NodeDragEventParams) => {
  console.log(info.node);
  dragNode.value = info.node;
};

/**
 * 处理 Hover到节点之上的提示效果,因使用的Event的参数，并不能跟准确的get到要使用的信息，所以使用了Dom
 * @param info
 */
const onDragOver = (info: NodeDragEventParams) => {
  Array.from(document?.getElementsByClassName("merge-node")).forEach((item) => {
    item.classList.remove("merge-node");
  });
  IsNodeMerge.value = false;
  let ele = document.getElementsByClassName(
    "ant-tree-drop-indicator"
  )[0] as HTMLElement;
  let rect: DOMRect;
  if (ele) {
    rect = ele.getBoundingClientRect();
    let dropNodeTitle =
      ele.parentElement
        ?.querySelector('[class="keytag"]')
        ?.getAttribute("title") || "";

    dropNodeKey.value =
      ele.parentElement
        ?.querySelector('[class="keytag"]')
        ?.getAttribute("idd") || "";

    const dropNode = findNode(state.gData, dropNodeKey.value);
    if (!dropNode) return;
    let diffLevel = 0;
    diffLevel = dropNode.level - dragNode?.value?.level;
    let pos = parseInt(ele.style.top) < 0 ? "之上" : "之下";
    if (diffLevel === 0) {
      if (parseInt(ele.style.left) === 28) {
        popMsg.value = `将与【${dropNodeTitle}】合并`;
        ele.parentElement
          ?.querySelector('[class="keytag"]')
          ?.classList.add("merge-node");
        ele.style.height = "0px";
        ele.style.overflow = "hidden";
      } else {
        popMsg.value = `将置于【${dropNodeTitle}】${pos}`;
      }
    } else if (diffLevel === 1) {
      if (parseInt(ele.style.left) === 28) {
        IsNodeMerge.value = true;
        popMsg.value = `将合入【${dropNodeTitle}】的子级`;
      } else {
        popMsg.value = `不可将不同层级的节点置于相同的层级`;
      }
    } else {
      popMsg.value = `不可跨级拖拽`;
    }

    if (pos) {
      popoverStyle.value = {
        position: "fixed",
        left: `${rect.left + 40}px`,
        top: `${rect.top + 30}px`,
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

/**
 * 鼠标离开，移除提示框
 */
const onDragLeave = () => {
  mergePopoverVisible.value = false;
  dropNodeKey.value = "";
  Array.from(document?.getElementsByClassName("merge-node")).forEach((item) => {
    item.classList.remove("merge-node");
  });
};

/**
 * 移动到最终节点 做与目标节点合并、添加到上方、添加到下方的逻辑
 * @param info 拖拽最终下放的节点
 */
const onDrop = (info: AntTreeNodeDropEvent) => {
  Array.from(document?.getElementsByClassName("merge-node")).forEach((item) => {
    item.classList.remove("merge-node");
  });
  mergePopoverVisible.value = false;
  let node: DataNode = info.node;
  // if (dropNodeKey.value && dropNodeKey.value !== node.key) {
  //   node = findNode(state.gData, dropNodeKey.value);
  // }

  const dropKey = node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info?.node?.pos?.split("-");
  const dropPosition =
    dropPos && info.dropPosition - Number(dropPos[dropPos?.length - 1]);
  const diffLevel = node.level - dragNode?.value?.level;
  if (!(diffLevel === 0 || (diffLevel === 1 && IsNodeMerge.value))) {
    // 目标节点与源节点存在一个级别的差距，则不执行拖拽操作给出提示
    message.error("不能跨层级拖拽");
    // 阻止默认行为，例如阻止重新排序或移动节点到其他父节点下
    return;
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
    if (diffLevel == 0) {
      mergeNodes(dragObj, dropKey);
    } else if (diffLevel == 1) {
      loop(data, dropKey, (item: TreeDataItem) => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    }
  } else if (
    (node.children || []).length > 0 && // Has children
    node.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, (item: TreeDataItem) => {
      item.children = item.children || [];
      // where to insert 示例添加到头部，可以是随意位置
      item.children.push(dragObj);
    });
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

/**
 *处理合并节点的逻辑函数
 * @param sourceNode 拖拽的源节点
 * @param targetKey  拖拽的目标节点
 */
const mergeNodes = (sourceNode: DataNode, targetKey: string | number) => {
  const data = [...(state.gData ? state.gData : [])];
  //const sourceNode = findNode(data, sourceKey);
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
  removeNode(data, sourceNode.key);
  state.gData = data;
};

/**
 * 根据key查找到对应的节点
 * @param tree 树结构数据
 * @param key 节点在树中的唯一键
 */
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

/**
 * 根据Key 查找到其上级父节点
 * @param tree 树结构数据
 * @param key 节点在树中的唯一键
 * @param parent 父节点
 */
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

/**
 *根据Key移除对应节点
 * @param tree 树结构数据
 * @param key 节点在树中的唯一键
 */
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
.draggable-tree {
  width: 300px;
  text-align: left;
}
.merge-node {
  background-color: rgb(111, 180, 215);
}
.keytag {
  display: inline-block;
  width: 100%;
}
.pop-div {
  background-color: #1677ff;
  padding: 6px 10px;
  color: #fff;
  text-align: left;
  border-radius: 4px;
  width: 200px;
}
</style>
