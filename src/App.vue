<template>
  <TreeCustom v-if="!loading" :gData="gData" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import TreeCustom from "./components/TreeCustom.vue";
import type { TreeProps } from "ant-design-vue/es/tree";

import { TreeApi } from "./api/tree";

const gData = ref<TreeProps["treeData"]>([]);
const loading = ref(true);

const init = async () => {
  const [e, r] = await TreeApi.getTreeNodes<TreeProps["treeData"]>();
  if (r && r.code === 200) {
    gData.value = r.data;
  }
  loading.value = false;
};
onMounted(() => {
  init();
});
</script>

<style scoped></style>
