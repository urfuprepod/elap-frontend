import {
  IconAd2,
  IconBookmark, IconBurger,
  IconChecklist, IconContract,
  IconHome,
  IconInfoCircle,
  IconLogout, IconMenu2, IconMessage, IconQuestionMark,
  IconUser,
  IconUsers, IconUserStar,
  IconVideo,
} from "@tabler/icons-react";
import {Button, Dropdown, Flex, Layout, Menu, Space, theme, Tooltip, Typography} from "antd";
import React, {useEffect, useState} from "react";
import "./custom-layout.scss";
import {useLocation, useNavigate} from "react-router-dom";
import {UserInfo} from "../../model/user-info";
import {UserAuthorityType} from "../../model/user-authority";
import Logo from '../../../media/logo.svg';
import {DownOutlined} from "@ant-design/icons";
import {ItemType, MenuItemType} from "antd/es/menu/interface";

const { Header, Content, Sider } = Layout;

type NavItem = {
  key: string;
  title: string;
  url: string;
  icon: React.ReactNode;
};

const navItemsForUnauthorizedUser: NavItem[] = [
  {
    key: "0",
    title: "Главная",
    url: "/",
    icon: <IconHome />
  },
  {
    key: "1",
    title: "Обучение",
    url: "/learn/",
    icon: <IconBookmark />
  },
  {
    key: "2",
    title: "О проекте",
    url: "/about",
    icon: <IconInfoCircle />
  },
  {
    key: "3",
    title: "Видеосюжеты",
    url: "/videos",
    icon: <IconVideo />
  },
];

const navItemsForUser: NavItem[] = [
  {
    key: "0",
    title: "Главная",
    url: "/",
    icon: <IconHome />
  },
  {
    key: "1",
    title: "Обучение",
    url: "/learn/",
    icon: <IconBookmark />
  },
  {
    key: "2",
    title: "Задания",
    url: "/tasks",
    icon: <IconChecklist />
  },
  {
    key: "3",
    title: "Вопросы ментору",
    url: "/messages",
    icon: <IconMessage />
  },
  {
    key: "4",
    title: "О проекте",
    url: "/about",
    icon: <IconInfoCircle />
  },
  {
    key: "5",
    title: "Видеосюжеты",
    url: "/videos",
    icon: <IconVideo />
  },
];

const navItemsForMentor: NavItem[] = [
  {
    key: "0",
    title: "Главная",
    url: "/",
    icon: <IconHome />
  },
  {
    key: "1",
    title: "О проекте",
    url: "/about",
    icon: <IconInfoCircle />
  },
  {
    key: "2",
    title: "Видеосюжеты",
    url: "/videos",
    icon: <IconVideo />
  },
  {
    key: "3",
    title: "Студенты",
    url: "/mentor/students",
    icon: <IconUsers />
  },
  {
    key: "4",
    title: "Задания",
    url: "/mentor/tasks",
    icon: <IconChecklist />
  },
  {
    key: "5",
    title: "Вопросы ментору",
    url: "/mentor/messages",
    icon: <IconMessage />
  },
];

const navItemsForAdmin: NavItem[] = [
  {
    key: "0",
    title: "Главная",
    url: "/",
    icon: <IconHome />
  },
  {
    key: "1",
    title: "О проекте",
    url: "/about",
    icon: <IconInfoCircle />
  },
  {
    key: "2",
    title: "Объявления",
    url: "/admin/advertisements",
    icon: <IconAd2 />
  },
  {
    key: "3",
    title: "Видеосюжеты",
    url: "/admin/videos",
    icon: <IconVideo />
  },
  {
    key: "4",
    title: "Студенты",
    url: "/admin/students",
    icon: <IconUsers />
  },
  {
    key: "5",
    title: "Менторы",
    url: "/admin/mentors",
    icon: <IconUserStar />
  },
  {
    key: "6",
    title: "Конструктор",
    url: "/admin/constructor",
    icon: <IconContract />
  },
  {
    key: "7",
    title: "Редактор FAQ",
    url: "/admin/faq",
    icon: <IconQuestionMark />
  }
];

export const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    getAndSetUserInfo();
    window.addEventListener('storage', () => {
      getAndSetUserInfo();
    });
  }, []);

  const getAndSetUserInfo = () => {
    const cachedUserInfo = window.localStorage.getItem("elap:portal:user");
    if (cachedUserInfo) {
      const userInfo: UserInfo = JSON.parse(cachedUserInfo);
      if (userInfo) {
        setUserInfo(userInfo);
      }
    } else {
      setUserInfo(null);
    }
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getNavItems = () => {
    const result: ItemType[] = [];

    if (userInfo?.authorities && userInfo?.authorities
      ?.filter((userAuthority) => userAuthority.authority === UserAuthorityType.ADMIN).length) {
      navItemsForAdmin.forEach((item) => {
        result.push({
              key: item.key,
              icon: item.icon,
              label: item.title,
              onClick: () => {
                navigate(item.url);
              }
        });
      });
    } else if (true) {
      navItemsForMentor.forEach((item) => {
        result.push({
          key: item.key,
          icon: item.icon,
          label: item.title,
          onClick: () => {
            navigate(item.url);
          }
        });
      });
    } else if (userInfo) {
      navItemsForUser.forEach((item) => {
        result.push({
          key: item.key,
          icon: item.icon,
          label: item.title,
          onClick: () => {
            navigate(item.url);
          }
        });
      });
    } else {
      navItemsForUnauthorizedUser.forEach((item) => {
        result.push({
          key: item.key,
          icon: item.icon,
          label: item.title,
          onClick: () => {
            navigate(item.url);
          }
        });
      });
    }

    return result;
  };

  const getActiveNavItemKey = (): string => {
    let result: string = "";

    if (userInfo?.authorities && userInfo.authorities
        .filter((userAuthority) => userAuthority.authority === UserAuthorityType.ADMIN).length) {
      const activePage = navItemsForAdmin.filter(
          (item) => location.pathname.includes(item.url)
      )[0];
      if (activePage) {
        result = activePage.key;
      }
    } else if (userInfo?.authorities && userInfo.authorities
        .filter((userAuthority) => userAuthority.authority === UserAuthorityType.MENTOR).length) {
      const activePage = navItemsForMentor.filter(
          (item) => location.pathname.includes(item.url)
      )[0];
      if (activePage) {
        result = activePage.key;
      }
    } else {
      const activePage = navItemsForUser.filter(
          (item) => location.pathname.includes(item.url)
      )[0];
      if (activePage) {
        result = activePage.key;
      }
    }

    return result;
  };

  return (
      <Layout style={{ height: "100vh" }}>
        <Sider width={200}>
          <Flex justify="center" align="center">
            <img style={{marginLeft: '22px', cursor: 'pointer'}} src={Logo} height={70} width={120}
                 onClick={() => navigate('/')} />
          </Flex>

          <div style={{overflow: "auto", height: "85%"}}>
            <Menu mode="inline" selectedKeys={[getActiveNavItemKey()]} items={getNavItems()} />
          </div>
        </Sider>
        <Layout>
          <Header
              className="header"
          >
            <Flex className="mobile-menu" justify="center" align="center">
              <Dropdown
                  menu={{
                    items: getNavItems(),
                    selectedKeys: [getActiveNavItemKey()]
                  }}
              >
                <Button
                    shape="circle"
                    icon={<IconMenu2 style={{marginTop: "2px"}} />}
                    size="large"
                />
              </Dropdown>
            </Flex>
            <Flex justify="center" align="center" gap={15}>
              {userInfo ? <span className="header-username">{userInfo.login}</span> : <Button
                  shape="round"
                  type="primary"
                  size="large"
                  onClick={() => {
                    navigate("/login");
                  }}
              >
                Войти
              </Button>}
              {userInfo ?  <Tooltip title="Личный кабинет" placement="bottom">
                <Button
                    shape="circle"
                    icon={<IconUser />}
                    size="large"
                    onClick={() => {
                      navigate("/account");
                    }}
                />
              </Tooltip> : null}
              {userInfo ?  <Tooltip title="Выйти" placement="bottom">
                <Button
                    shape="circle"
                    icon={<IconLogout />}
                    size="large"
                    onClick={() => {
                      navigate("/logout");
                    }}
                />
              </Tooltip> : null}
            </Flex>
          </Header>
          <Content
              style={{
                borderTopLeftRadius: borderRadiusLG,
                backgroundColor: colorBgContainer,
                paddingLeft: "16px",
                paddingRight: "16px",
                paddingTop: "16px",
                overflow: "auto",
                height: "100%"
              }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
  );
};
