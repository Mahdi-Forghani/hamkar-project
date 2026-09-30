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

import AuthLayout from "../components/AuthLayout";
import PageTitle from "../components/PageTitle";
import { useAuth } from "../context/AuthContext";
import { getApiErrorData } from "../utils/apiError";

const {
  Title,
  Text,
} = Typography;

export default function VerifyPage() {
  const [searchParams] =
    useSearchParams();

  const redirectUrl =
    searchParams.get("redirect") || "/";

  const navigate = useNavigate();

  const {
    registration,
    verify,
  } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleVerify() {
    setLoading(true);

    try {
      const nextStep =
        await verify(code);

      if (nextStep === "set-password") {
        message.success(
          "شماره موبایل با موفقیت تأیید شد.",
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
          "تأیید شماره موبایل انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  function changeNumber() {
    navigate(
      `/register?redirect=${encodeURIComponent(
        redirectUrl,
      )}`,
    );
  }

  return (
    <>
      <PageTitle title="تأیید شماره موبایل" />

      <AuthLayout>
        <Title
          level={3}
          style={{
            margin: 0,
            textAlign: "center",
          }}
        >
          تأیید شماره موبایل
        </Title>

        <Text
          type="secondary"
          style={{
            textAlign: "center",
          }}
        >
          کد تأیید برای شماره زیر ارسال شد
        </Text>

        <Text
          strong
          style={{
            textAlign: "center",
            fontSize: 16,
          }}
        >
          {registration?.mobileNumber}
        </Text>

        <Button
          type="link"
          onClick={changeNumber}
          style={{
            padding: 0,
          }}
        >
          تغییر شماره موبایل
        </Button>

        <Input
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          placeholder="کد تأیید"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
        />

        <Button
          type="primary"
          block
          loading={loading}
          disabled={!code}
          onClick={handleVerify}
        >
          تأیید
        </Button>
      </AuthLayout>
    </>
  );
}