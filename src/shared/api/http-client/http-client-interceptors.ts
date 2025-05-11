import {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const onRequest = async (config: InternalAxiosRequestConfig) => {
  const token = window.localStorage.getItem("elap:portal:auth");
  // if (token) {
  //   config.headers = config.headers || {};
  //   config.headers["Authorization"] = `Basic ${token}`;
  // } else {
  //   if (config.url === "/account" ||
  //       config.url === "/messages" ||
  //       config.url === "/tasks" ||
  //       config.url?.includes("mentor") ||
  //       config.url?.includes("admin")) {
  //     window.location.replace("/login");
  //   }
  // }

  return config;
};

export const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(onRequest);
  return instance;
};
