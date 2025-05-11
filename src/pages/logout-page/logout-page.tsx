import React, {useEffect} from "react";
import {httpClient} from "../../shared/api/http-client";
import {config} from "../../shared/config";
import {useNavigate} from "react-router-dom";

export const LogoutPage = (): JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    httpClient.axios().post(config.endPoints.logout).then(() => {
      window.localStorage.removeItem("elap:portal:auth");
      window.localStorage.removeItem("elap:portal:user");
      window.localStorage.removeItem("elap:portal:user:lastUpdateDate");
      window.dispatchEvent(new Event("storage"));
      window.location.replace("/");
    }).catch(() => {
      navigate("/error");
    })
  }, []);

  return (<></>);
};
