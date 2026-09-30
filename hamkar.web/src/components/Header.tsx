import { useState } from "react";

import {
  Button,
  Dropdown,
  Drawer,
  Layout,
  Tooltip,
} from "antd";

import {
  CloseOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useTheme } from "../theme/ThemeProvider";

const { Header: AntHeader } = Layout;

const navItems = [
  {
    key: "/",
    label: "جستجو",
  },
  {
    key: "/offers",
    label: "کالاهای من",
  },
  {
    key: "/access",
    label: "مدیریت دسترسی",
  },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { mode, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  function handleMobileNavigation(path: string) {
    setMobileMenuOpen(false);
    navigate(path);
  }

  return (
    <AntHeader className="app-navbar">
      <div className="app-navbar-inner">

        <div className="navbar-brand">

          {/* Mobile navigation */}
          <button
            type="button"
            className="navbar-mobile-menu"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="منو"
          >
            <MenuOutlined />
          </button>

          <button
            type="button"
            className="navbar-logo"
            onClick={() => navigate("/")}
          >
            همکار
          </button>

          <nav className="navbar-nav">
            {navItems.map((item) => {
              const active =
                location.pathname === item.key;

              return (
                <button
                  type="button"
                  key={item.key}
                  className={`navbar-link ${active ? "active" : ""}`}
                  onClick={() => navigate(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="navbar-actions">

          {/* Theme - Desktop */}
          <Tooltip
            title={
              mode === "dark"
                ? "حالت روشن"
                : "حالت تاریک"
            }
          >
            <button
              type="button"
              className="navbar-theme-toggle"
              onClick={toggleTheme}
              aria-label={
                mode === "dark"
                  ? "حالت روشن"
                  : "حالت تاریک"
              }
            >
              {mode === "dark" ? (
                <SunOutlined />
              ) : (
                <MoonOutlined />
              )}
            </button>
          </Tooltip>


          {/* Desktop profile */}
          <button
            type="button"
            className="navbar-avatar navbar-avatar-desktop"
            onClick={() => navigate("/profile")}
            aria-label="پروفایل"
          >
            <UserOutlined />
          </button>


          {/* Mobile profile */}
          <div className="navbar-avatar-mobile">
            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    label: "پروفایل",
                    icon: <UserOutlined />,
                  },
                  {
                    key: "theme",
                    label:
                      mode === "dark"
                        ? "حالت روشن"
                        : "حالت تاریک",
                    icon:
                      mode === "dark"
                        ? <SunOutlined />
                        : <MoonOutlined />,
                  },
                  {
                    key: "logout",
                    label: "خروج",
                    icon: <LogoutOutlined />,
                    danger: true,
                  },
                ],
                onClick: ({ key }) => {
                  if (key === "profile") {
                    navigate("/profile");
                  }

                  if (key === "theme") {
                    toggleTheme();
                  }

                  if (key === "logout") {
                    handleLogout();
                  }
                },
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                className="navbar-avatar"
                aria-label="پروفایل"
              >
                <UserOutlined />
              </button>
            </Dropdown>
          </div>


          {/* Desktop logout */}
          <Tooltip title="خروج">
            <Button
              type="text"
              icon={
                <LogoutOutlined className="icon-reverse" />
              }
              onClick={handleLogout}
              className="navbar-logout"
            />
          </Tooltip>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      <Drawer
        placement="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        closable={false}
        width="100%"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="mobile-navigation">

          <div className="mobile-navigation-header">
            <span>همکار</span>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="بستن منو"
            >
              <CloseOutlined />
            </button>
          </div>

          <nav className="mobile-navigation-links">
            {navItems.map((item) => {
              const active =
                location.pathname === item.key;

              return (
                <button
                  type="button"
                  key={item.key}
                  className={`mobile-navigation-link ${active ? "active" : ""
                    }`}
                  onClick={() =>
                    handleMobileNavigation(item.key)
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

        </div>
      </Drawer>
    </AntHeader>
  );
}