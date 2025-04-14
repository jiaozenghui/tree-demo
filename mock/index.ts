const gData = [
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

export default [
  {
    url: "/api/utils/treeDatas",
    method: "get",
    response: () => {
      return {
        code: 200,
        data: gData,
      };
    },
  },
  {
    url: "/api/category",
    type: "get",
    response: () => {
      return {
        code: 200,
        data: [
          {
            id: 1,
            title: "JAVA",
            href: "/category/java",
          },
          {
            id: 2,
            title: "SpringBoot",
            href: "/category/SpringBoot",
          },
          {
            id: 3,
            title: "MySql",
            href: "/category/MySql",
          },
          {
            id: 4,
            title: "随笔",
            href: "/category/live",
          },
        ],
      };
    },
  },
];
