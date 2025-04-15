import { VueWrapper, mount } from "@vue/test-utils";
import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
  vitest,
  type Mocked,
} from "vitest";
import axios from "axios";
import TreeCustom from "./../TreeCustom.vue";
import { message, Tree as ATree } from "ant-design-vue";

let wrapper: VueWrapper<any>;
const testFile = new File(["test"], "test.png", { type: "image/png" });
vi.mock("axios");

const mockedAxios = axios as Mocked<typeof axios>;
const data = [
  {
    title: "0-0",
    key: "0-0",
    children: [
      {
        title: "0-0-0",
        key: "0-0-0",
        children: [
          { title: "0-0-0-0", key: "0-0-0-0" },
          { title: "0-0-0-1", key: "0-0-0-1" },
          { title: "0-0-0-2", key: "0-0-0-2" },
        ],
      },
      {
        title: "0-0-1",
        key: "0-0-1",
        children: [
          { title: "0-0-1-0", key: "0-0-1-0" },
          { title: "0-0-1-1", key: "0-0-1-1" },
          { title: "0-0-1-2", key: "0-0-1-2" },
        ],
      },
      { title: "0-0-2", key: "0-0-2" },
    ],
  },
  {
    title: "0-1",
    key: "0-1",
    children: [
      {
        title: "0-1-0",
        key: "0-1-0",
        children: [
          { title: "0-1-0-0", key: "0-1-0-0" },
          { title: "0-1-0-1", key: "0-1-0-1" },
          { title: "0-1-0-2", key: "0-1-0-2" },
        ],
      },
      {
        title: "0-1-1",
        key: "0-1-1",
        children: [
          { title: "0-1-1-0", key: "0-1-1-0" },
          { title: "0-1-1-1", key: "0-1-1-1" },
          { title: "0-1-1-2", key: "0-1-1-2" },
        ],
      },
      { title: "0-1-2", key: "0-1-2" },
    ],
  },
  { title: "0-2", key: "0-2" },
];

describe("TreeCustom Component", () => {
  beforeAll(() => {
    wrapper = mount(TreeCustom, {
      props: {
        gData: data,
      },
      global: {
        plugins: [ATree],
      },
    });
  });

  it.only("renders list items correctly", () => {
    const treeNodes = wrapper.findAllComponents({ name: "ATreeNode" });
    expect(treeNodes.length).toBe(9);
    expect(wrapper.findComponent(ATree).exists()).toBe(true);
    expect(wrapper.findComponent(ATree).props("draggable")).toBe(true);
  });

  it("handles drop events correctly", async () => {
    const wrapper = mount(TreeCustom, {
      global: {
        components: {
          "a-tree": ATree,
        },
      },
    });

    const tree = wrapper.findComponent(ATree);

    // 模拟拖拽事件数据
    const mockEvent = {
      node: {
        key: "0-1-0", // 目标节点
        pos: "0-1-0",
      },
      dragNode: {
        key: "0-0-1", // 拖拽的节点
      },
      dropPosition: 1,
      dropToGap: true,
    };

    // 触发 drop 事件
    await tree.vm.$emit("drop", mockEvent);

    // 验证事件是否触发
    expect(wrapper.emitted("drop")).toBeTruthy();
    expect(wrapper.emitted("drop")[0][0]).toEqual(mockEvent);
  });

  it("updates tree data after drop", async () => {
    const wrapper = mount(TreeCustom, {
      global: {
        components: {
          "a-tree": ATree,
        },
      },
    });

    // 初始数据
    const initialData = wrapper.vm.gData;
    expect(initialData[0].children.length).toBe(2);
    expect(initialData[1].children.length).toBe(2);

    // 模拟从 Parent 1 拖到 Parent 2
    const mockEvent = {
      node: {
        key: "0-1", // Parent 2
        pos: "0-1",
      },
      dragNode: {
        key: "0-0-1", // Child 2
      },
      dropPosition: 1,
      dropToGap: false,
    };

    // 触发 drop 事件
    await wrapper.vm.onDrop(mockEvent);

    // 验证数据变化
    const updatedData = wrapper.vm.gData;
    expect(updatedData[0].children.length).toBe(1); // Parent 1 少了一个子节点
    expect(updatedData[1].children.length).toBe(3); // Parent 2 多了一个子节点
  });

  it("handles different drop positions", async () => {
    const wrapper = mount(TreeCustom, {
      global: {
        components: {
          "a-tree": ATree,
        },
      },
    });

    // 测试拖拽到节点上方
    const mockEventAbove = {
      node: {
        key: "0-1-0",
        pos: "0-1-0",
      },
      dragNode: {
        key: "0-0-1",
      },
      dropPosition: -1, // 上方
      dropToGap: false,
    };

    await wrapper.vm.onDrop(mockEventAbove);

    // 测试拖拽到节点下方
    const mockEventBelow = {
      node: {
        key: "0-1-0",
        pos: "0-1-0",
      },
      dragNode: {
        key: "0-0-0",
      },
      dropPosition: 1, // 下方
      dropToGap: true,
    };

    await wrapper.vm.onDrop(mockEventBelow);

    // 添加你的断言
  });

  it("respects drag restrictions", async () => {
    // 修改组件添加拖拽验证函数
    const wrapper = mount(TreeCustom, {
      global: {
        components: {
          "a-tree": ATree,
        },
      },
      props: {
        allowDrop: ({ dropNode, dragNode }) => {
          return dragNode.key.includes("0-0") && dropNode.key.includes("0-1");
        },
      },
    });

    const validDrag = {
      node: { key: "0-1-0" }, // 目标节点在 0-1 分支
      dragNode: { key: "0-0-1" }, // 拖拽节点在 0-0 分支
    };

    const invalidDrag = {
      node: { key: "0-0-0" }, // 目标节点在 0-0 分支
      dragNode: { key: "0-1-1" }, // 拖拽节点在 0-1 分支
    };

    expect(wrapper.vm.allowDrop(validDrag)).toBe(true);
    expect(wrapper.vm.allowDrop(invalidDrag)).toBe(false);
  });

  afterEach(() => {
    mockedAxios.post.mockReset();
  });
});
