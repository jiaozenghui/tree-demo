import axios from "axios";

type Fn = (data: FcResponse<any>) => unknown;

interface IAnyObj {
  [index: string]: unknown;
}

interface FcResponse<T> {
  errno: number;
  message: string;
  data: T;
}

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const Get = <T>(
  url: string,
  params: IAnyObj,
  config: IAnyObj = {},
  clearFn?: Fn
): Promise<[any, FcResponse<T> | undefined]> =>
  new Promise((resolve) => {
    axios
      .get(url, { params, ...config })
      .then((result) => {
        let res: FcResponse<T>;
        if (clearFn !== undefined) {
          res = clearFn(result.data) as unknown as FcResponse<T>;
        } else {
          res = result.data as FcResponse<T>;
        }
        resolve([null, res as FcResponse<T>]);
      })
      .catch((err) => {
        resolve([err, undefined]);
      });
  });

export const Delete = <T>(
  url: string,
  config: IAnyObj = {},
  clearFn?: Fn
): Promise<[any, FcResponse<T> | undefined]> =>
  new Promise((resolve) => {
    axios
      .delete(url, { ...config })
      .then((result) => {
        let res: FcResponse<T>;
        if (clearFn !== undefined) {
          res = clearFn(result.data) as unknown as FcResponse<T>;
        } else {
          res = result.data as FcResponse<T>;
        }
        resolve([null, res as FcResponse<T>]);
      })
      .catch((err) => {
        resolve([err, undefined]);
      });
  });

export const Post = <T>(
  url: string,
  data: IAnyObj,
  config: IAnyObj = {}
): Promise<[any, FcResponse<T> | undefined]> => {
  return new Promise((resolve) => {
    axios
      .post(url, data, { ...config })
      .then((result) => {
        resolve([null, result.data as FcResponse<T>]);
      })
      .catch((err) => {
        resolve([err, undefined]);
      });
  });
};

export const Patch = <T>(
  url: string,
  data: IAnyObj,
  config: IAnyObj = {}
): Promise<[any, FcResponse<T> | undefined]> => {
  return new Promise((resolve) => {
    axios
      .patch(url, data, { ...config })
      .then((result) => {
        resolve([null, result.data as FcResponse<T>]);
      })
      .catch((err) => {
        resolve([err, undefined]);
      });
  });
};
