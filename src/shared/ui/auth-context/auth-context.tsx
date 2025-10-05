import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserInfo } from "../../model/user-info";
import { UserAuthorityType } from "../../../shared/model/user-authority";

type AuthContext = {
  userInfo: UserInfo;
} | null;

export const authContextDefaultValue: AuthContext = {
  userInfo: {
    id: 2,
    login: 'papich',
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
