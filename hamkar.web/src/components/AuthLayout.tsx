import type { ReactNode } from "react";
import { Card, Tooltip } from "antd";
import {
    MoonOutlined,
    SunOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import { useTheme } from "../theme/ThemeProvider";

import logo from "../../public/favicon.svg";

export default function AuthLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { mode, toggleTheme } = useTheme();

    return (
        <div className="auth-page">
            <Card className="auth-card">

                <Tooltip
                    title={
                        mode === "dark"
                            ? "حالت روشن"
                            : "حالت تاریک"
                    }
                >
                    <button
                        type="button"
                        className="auth-theme-button"
                        onClick={toggleTheme}
                    >
                        {mode === "dark"
                            ? <SunOutlined />
                            : <MoonOutlined />}
                    </button>
                </Tooltip>

                <Link
                    to="/"
                    className="brand"
                >
                    <img
                        src={logo}
                        className="brand-logo"
                    />

                    <span className="brand-name">
                        همکار
                    </span>
                </Link>

                <div className="auth-content">
                    {children}
                </div>

            </Card>
        </div>
    );
}