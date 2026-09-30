import { useState } from "react";
import {
  Button,
  Input,
  Typography,
  message,
} from "antd";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import PageTitle from "../components/PageTitle";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { getApiErrorData } from "../utils/apiError";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    try {
      const result = await login(
        username,
        password,
      );

      if (result === "verify") {
        message.success("کد تأیید برای شما ارسال شد.");

        navigate(
          `/verify?redirect=${encodeURIComponent(
            redirectUrl || "/",
          )}`,
          {
            replace: true,
          },
        );

        return;
      }

      message.success("با موفقیت وارد شدید.");

      navigate(redirectUrl || "/", {
        replace: true,
      });
    } catch (error) {
      const data = getApiErrorData(error);

      message.error(
        data?.message || "ورود انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle title="ورود" />

      <AuthLayout>
        <Title
          level={3}
          style={{ margin: 0, textAlign: "center" }}
        >
          ورود
        </Title>

        <Text
          type="secondary"
          style={{ textAlign: "center" }}
        >
          وارد حساب کاربری خود شوید
        </Text>

        <Input
          autoComplete="username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          placeholder="شماره موبایل"
        />

        <Input.Password
          autoComplete="current-password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="رمز عبور"
          onPressEnter={handleLogin}
        />

        <Button
          type="primary"
          loading={loading}
          disabled={!username || !password}
          onClick={handleLogin}
          block
        >
          ورود
        </Button>

        <Text
          style={{
            textAlign: "center",
            marginTop: 2,
          }}
        >
          حساب کاربری ندارید؟{" "}
          <Link to="/register">
            ثبت‌نام کنید
          </Link>
        </Text>
      </AuthLayout>
    </>
  );
}