import React from "react";

import "./app.scss";
import { config } from "shared/config";
import { ConfigProvider, App as AntApp } from "antd";
import { httpClient } from "shared/api/http-client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { CustomLayout } from "shared/ui/custom-layout/custom-layout";
import { MainPage } from "pages/main-page";
import ruRU from "antd/locale/ru_RU";
import { LoginPage } from "pages/login-page";
import { NotFoundPage } from "pages/not-found-page";
import { ErrorPage } from "pages/error-page";
import { AuthContextProvider } from "shared/ui/auth-context/auth-context";
import { LogoutPage } from "../pages/logout-page";
import { RegisterPage } from "../pages/register-page";
import { AccountPage } from "../pages/account-page";
import { MessagesPage } from "../pages/messages-page";
import { AboutPage } from "../pages/about-page";
import { VideosPage } from "../pages/videos-page";
import { LearnSectionsPage } from "../pages/learn-sections-page";
import { LearnSubsectionsPage } from "../pages/learn-subsections-page";
import { AdvertisementsPage } from "../pages/advertisements-page";
import { LearnSubsectionContent } from "../pages/learn-subsection-content-page/learn-subsection-content-page";
import { MentorStudentsPage } from "../pages/mentor-students-page";
import { MentorMessagesPage } from "../pages/mentor-messages-page";
import { AdminMentorsPage } from "../pages/admin-mentors-page";
import { AdminConstructorPage } from "../pages/admin-constructor-page";
import { AdminConstructorContentPage } from "../pages/admin-constructor-content-page";
import { MentorTasksPage } from "../pages/mentor-tasks-page";

import { TasksPage } from "../pages/tasks-page";
import { SuccessRegisterPage } from "../pages/sucess-register-page";
import { ResetPasswordPage } from "../pages/reset-password-page";
import { AdminFaqPage } from "../pages/admin-faq-page";

httpClient.axios().defaults.baseURL = config.baseApiUrl;

function App() {
    return (
        <Router>
            <ConfigProvider
                locale={ruRU}
                theme={{
                    token: {
                        colorPrimary: "#d8b2ed",
                        colorBgContainer: "#fff",
                        fontFamily: "'Montserrat', sans-serif",
                    },
                    components: {
                        Layout: {
                            bodyBg: "#d5f7d4",

                            siderBg: "#d5f7d4",

                            triggerBg: "#d5f7d4",
                            triggerColor: "#000",

                            headerBg: "#d5f7d4",
                            headerColor: "#000",
                            headerHeight: 70,
                        },
                        Menu: {
                            activeBarBorderWidth: 0,
                            colorBgContainer: "#d5f7d4",
                            itemSelectedColor: "#000",
                            itemActiveBg: "#fff",
                            itemSelectedBg: "#fff",
                            itemHeight: 95,
                            itemMarginBlock: 12,
                            itemMarginInline: 20,
                            iconMarginInlineEnd: 0,

                            collapsedIconSize: 60,
                        },
                        Button: {
                            colorText: "#000",
                            fontWeight: "600",

                            defaultShadow: "none",
                            defaultBg: "#FFFFFF5E",
                            defaultHoverBg: "#b3d1b2",
                            defaultHoverColor: "#000",
                            defaultHoverBorderColor: "#FFFFFF5E",
                            defaultBorderColor: "#FFFFFF5E",
                            defaultActiveBg: "#fff",
                            defaultActiveBorderColor: "#fff",
                            defaultActiveColor: "#000",

                            primaryColor: "#000",
                            colorPrimaryHover: "#d8b2ed",
                            colorPrimaryTextHover: "#a78db2",
                        },
                    },
                }}
            >
                <AntApp>
                    <CustomLayout>
                        <Routes>
                            <Route path="/" element={<MainPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/register"
                                element={<RegisterPage />}
                            />
                            <Route
                                path="/reset-password/:resetPassRequestId"
                                element={<ResetPasswordPage />}
                            />
                            <Route path="/logout" element={<LogoutPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/error" element={<ErrorPage />} />

                            <Route
                                path="/learn"
                                element={<LearnSectionsPage />}
                            />
                            <Route
                                path="/learn/:sectionId"
                                element={<LearnSubsectionsPage />}
                            />
                            <Route
                                path="/learn/:sectionId/:subsectionId"
                                element={<LearnSubsectionContent />}
                            />
                            <Route
                                path="/advertisements"
                                element={<AdvertisementsPage />}
                            />
                            <Route path="/videos" element={<VideosPage />} />

                            <Route
                                path="/admin/advertisements"
                                element={
                                    <AuthContextProvider>
                                        <AdvertisementsPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/admin/videos"
                                element={
                                    <AuthContextProvider>
                                        <VideosPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/admin/faq"
                                element={
                                    <AuthContextProvider>
                                        <AdminFaqPage />
                                    </AuthContextProvider>
                                }
                            />

                            <Route
                                path="/account"
                                element={
                                    <AuthContextProvider>
                                        <AccountPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/messages"
                                element={
                                    <AuthContextProvider>
                                        <MessagesPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/tasks"
                                element={
                                    <AuthContextProvider>
                                        <TasksPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/mentor/students"
                                element={
                                    <AuthContextProvider>
                                        <MentorStudentsPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/admin/students"
                                element={
                                    <AuthContextProvider>
                                        <MentorStudentsPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/mentor/tasks"
                                element={
                                    <AuthContextProvider>
                                        <MentorTasksPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/mentor/messages"
                                element={
                                    <AuthContextProvider>
                                        <MentorMessagesPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/admin/mentors"
                                element={
                                    <AuthContextProvider>
                                        <AdminMentorsPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/admin/constructor"
                                element={
                                    <AuthContextProvider>
                                        <AdminConstructorPage />
                                    </AuthContextProvider>
                                }
                            />
                            <Route
                                path="/admin/constructor/:sectionId/:subsectionId"
                                element={
                                    <AuthContextProvider>
                                        <AdminConstructorContentPage />
                                    </AuthContextProvider>
                                }
                            />

                            <Route
                                path="/success-register"
                                element={<SuccessRegisterPage />}
                            />
                            <Route
                                path="/not-found"
                                element={<NotFoundPage />}
                            />
                            <Route path="/*" element={<NotFoundPage />} />
                        </Routes>
                    </CustomLayout>
                </AntApp>
            </ConfigProvider>
        </Router>
    );
}

export default App;
