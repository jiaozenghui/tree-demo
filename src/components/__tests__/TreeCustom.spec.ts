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

  it("renders list items correctly", () => {
    const treeNodes = wrapper.findAllComponents({ name: "ATreeNode" });
    expect(treeNodes.length).toBe(9);
  });

  afterEach(() => {
    mockedAxios.post.mockReset();
  });
});
