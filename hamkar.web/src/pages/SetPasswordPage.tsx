import { useState } from "react";
import {
  Button,
  Input,
  Typography,
  message,
} from "antd";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import PageTitle from "../components/PageTitle";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { getApiErrorData } from "../utils/apiError";

const { Title, Text } = Typography;

export default function SetPasswordPage() {
  const [searchParams] =
    useSearchParams();

  const redirectUrl =
    searchParams.get("redirect") || "/";

  const navigate = useNavigate();

  const {
    setPassword: savePassword,
  } = useAuth();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const passwordMatched =
    password.length > 0 &&
    password === confirmPassword;

  async function handleSetPassword() {
    if (!passwordMatched) {
      return;
    }

    setLoading(true);

    try {
      await savePassword(password);

      message.success(
        "رمز عبور با موفقیت ثبت شد.",
      );

      navigate(
        `/profile?redirect=${encodeURIComponent(
          redirectUrl,
        )}`,
        {
          replace: true,
        },
      );
    } catch (error) {
      const data =
        getApiErrorData(error);

      message.error(
        data?.message ||
          "ثبت رمز عبور انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle title="تعیین رمز عبور" />

      <AuthLayout>
        <Title
          level={3}
          style={{
            margin: 0,
            textAlign: "center",
          }}
        >
          تعیین رمز عبور
        </Title>

        <Text
          type="secondary"
          style={{
            textAlign: "center",
          }}
        >
          برای تکمیل ثبت‌نام رمز عبور خود را وارد کنید
        </Text>

        <Input.Password
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="رمز عبور"
          autoComplete="new-password"
        />

        <Input.Password
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value,
            )
          }
          placeholder="تکرار رمز عبور"
          autoComplete="new-password"
        />

        <Button
          type="primary"
          block
          loading={loading}
          disabled={!passwordMatched}
          onClick={handleSetPassword}
        >
          ثبت رمز عبور
        </Button>
      </AuthLayout>
    </>
  );
}