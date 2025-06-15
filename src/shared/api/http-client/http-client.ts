import axiosStatic, { AxiosInstance } from "axios";

import { setupInterceptors } from "./http-client-interceptors";

type HttpClient = {
  axios: (baseURL?: string) => AxiosInstance;
};

const axiosInstance: AxiosInstance = axiosStatic.create();

const axios = (baseURL?: string) => {
  let instance: AxiosInstance = axiosInstance;

  instance = axiosStatic.create({
    baseURL: "/api",
    withCredentials: true
  });
  setupInterceptors(instance);

  return instance;
};

setupInterceptors(axiosInstance);

export const httpClient: HttpClient = {
  axios,
};

// export const BaseInstanse = axios.create({
//   withCredentials: true,
//   baseURL: `${urlApi}`,
//   headers: { "Content-Type": "multipart/form-data" },
// });
