import type { ApiResponse } from "axios";
import { Get } from "./../utils/http";

/**
 *
 * 树接口集合
 * @method getTreeNodes
 */
export const TreeApi = {
  getTreeNodes: <T>(data = {}): ApiResponse<T> => {
    return Get<T>("/api/utils/list", data);
  },
};
