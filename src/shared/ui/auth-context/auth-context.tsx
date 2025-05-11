import React, { createContext, ReactNode, useEffect, useState } from "react";

import { config } from "shared/config";

import { httpClient } from "shared/api/http-client";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { UserInfo } from "../../model/user-info";
import { UserAuthorityType } from "../../../shared/model/user-authority";

type AuthContext = {
  userInfo: UserInfo;
} | null;

export const authContextDefaultValue: AuthContext = {
  userInfo: {
    id: 2,
    firstName: "Илюха",
    lastName: "Папич",
    patronymic: "",
    fullName: "sexer",
    email: "",
    isActive: true,
    authorities: [{ authority: UserAuthorityType.ADMIN }],
  },
};

export const AuthContext = createContext<AuthContext>(authContextDefaultValue);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [authContext, setAuthContext] = useState<AuthContext>(
    authContextDefaultValue
  );

  useEffect(() => {
    // const cachedUserInfo = window.localStorage.getItem("elap:portal:user");
    // if (cachedUserInfo) {
    //   if (!cacheNotExpire()) {
    //     tryGetAndSetUserInfo();
    //   }
    //   const userInfo: UserInfo = JSON.parse(cachedUserInfo);
    //   if (userInfo) {
    //     setAuthContext({ userInfo });
    //   } else {
    //     window.localStorage.removeItem("elap:portal:auth");
    //     window.localStorage.removeItem("elap:portal:user");
    //     window.localStorage.removeItem("elap:portal:user:lastUpdateDate");
    //     window.dispatchEvent(new Event("storage"));
    //     navigate("/login");
    //   }
    // } else {
    //   tryGetAndSetUserInfo();
    // }
  }, []);

  const tryGetAndSetUserInfo = () => {
    // httpClient
    //   .axios()
    //   .get<UserInfo>(config.endPoints.getUserInfoUrl)
    //   .then((response) => {
    //     const userInfo = response.data;
    //     if (userInfo) {
    //       if (userInfo.isActive) {
    //         setAuthContext({ userInfo: response.data });
    //         window.localStorage.setItem(
    //           "elap:portal:user",
    //           JSON.stringify(userInfo)
    //         );
    //         window.localStorage.setItem(
    //           "elap:portal:user:lastUpdateDate",
    //           new Date().getTime().toString()
    //         );
    //         window.dispatchEvent(new Event("storage"));
    //       } else {
    //         window.localStorage.removeItem("elap:portal:auth");
    //         window.localStorage.removeItem("elap:portal:user");
    //         window.localStorage.removeItem("elap:portal:user:lastUpdateDate");
    //         window.dispatchEvent(new Event("storage"));
    //         navigate("/login");
    //       }
    //     }
    //   })
    //   .catch((error: AxiosError) => {
    //     if (error.status === 401) {
    //       window.localStorage.removeItem("elap:portal:auth");
    //       window.localStorage.removeItem("elap:portal:user");
    //       window.localStorage.removeItem("elap:portal:user:lastUpdateDate");
    //       window.dispatchEvent(new Event("storage"));
    //       navigate("/login");
    //     } else {
    //       navigate("/error");
    //     }
    //   });
  };

  const cacheNotExpire = (): boolean => {
    const cachedUserInfoLastUpdateDate = window.localStorage.getItem(
      "elap:portal:user:lastUpdateDate"
    );
    if (cachedUserInfoLastUpdateDate) {
      return (
        (Date.parse(cachedUserInfoLastUpdateDate) - new Date().getTime()) /
          60000 <
        5
      );
    } else {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};
