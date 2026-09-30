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

export default function RegisterPage() {
  const [searchParams] =
    useSearchParams();

  const redirectUrl =
    searchParams.get("redirect") || "/";

  const navigate = useNavigate();
  const { register } = useAuth();

  const [mobileNumber, setMobileNumber] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleRegister() {
    setLoading(true);

    try {
      const nextStep =
        await register(mobileNumber);

      if (nextStep === "verify") {
        message.success(
          "کد تأیید برای شما ارسال شد.",
        );

        navigate(
          `/verify?redirect=${encodeURIComponent(
            redirectUrl,
          )}`,
          {
            replace: true,
          },
        );

        return;
      }

      if (nextStep === "set-password") {
        message.success(
          "شماره موبایل شما تأیید شد.",
        );

        navigate(
          `/set-password?redirect=${encodeURIComponent(
            redirectUrl,
          )}`,
          {
            replace: true,
          },
        );
      }
    } catch (error) {
      const data =
        getApiErrorData(error);

      message.error(
        data?.message ||
          "ثبت‌نام انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle title="ثبت‌نام" />

      <AuthLayout>
        <Title
          level={3}
          style={{
            margin: 0,
            textAlign: "center",
          }}
        >
          ثبت‌نام
        </Title>

        <Text
          type="secondary"
          style={{
            textAlign: "center",
          }}
        >
          برای ثبت‌نام شماره موبایل خود را وارد کنید
        </Text>

        <Input
          value={mobileNumber}
          onChange={(e) =>
            setMobileNumber(e.target.value)
          }
          placeholder="شماره موبایل"
          inputMode="tel"
          autoComplete="tel"
        />

        <Button
          type="primary"
          loading={loading}
          disabled={!mobileNumber}
          onClick={handleRegister}
          block
        >
          ادامه
        </Button>

        <Text
          style={{
            textAlign: "center",
          }}
        >
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            to={`/login?redirect=${encodeURIComponent(
              redirectUrl,
            )}`}
          >
            وارد شوید
          </Link>
        </Text>
      </AuthLayout>
    </>
  );
}