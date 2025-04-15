import type {
  AntTreeNodeDragEnterEvent,
  AntTreeNodeDropEvent,
  TreeProps,
} from "ant-design-vue/es/tree";

const gData = [
  {
    title: "0-0",
    key: "0-0",
    level: 0,
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
    level: 0,
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
  { title: "0-2", key: "0-2", level: 0 },
];

const x = 3;
const y = 2;
const z = 1;
const genData = [];

const generateData = (
  _level: number,
  _preKey?: string,
  _tns?: TreeProps["treeData"]
) => {
  const preKey = _preKey || "0";
  const tns = _tns || genData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key, level: _level });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);

export default [
  {
    url: "/api/utils/list",
    method: "get",
    response: () => {
      return {
        errno: 0,
        data: genData,
      };
    },
  },
];
