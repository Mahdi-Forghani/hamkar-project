import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  List,
  message,
  Space,
  Spin,
  Typography,
} from "antd";

import Header from "../components/Header";
import {
  getMyGrants,
  grantAccess,
  revokeAccess,
  type AccessGrant,
} from "../api/access";
import { formatMobile } from "../utils/toPersianDigits";
import { getApiErrorData } from "../utils/apiError";
import PageTitle from "../components/PageTitle";

const { Text } = Typography;

export default function AccessPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);

  async function loadGrants() {
    setLoading(true);

    try {
      const result = await getMyGrants();
      setGrants(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGrants();
  }, []);

  async function handleGrant() {
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedPhoneNumber) return;

    setGranting(true);

    try {
      await grantAccess(trimmedPhoneNumber);

      setPhoneNumber("");
      message.success("دسترسی با موفقیت اعطا شد.");

      await loadGrants();
    } catch (error) {
      const data = getApiErrorData(error);
      message.error(data?.message || "اعطای دسترسی انجام نشد.");
    } finally {
      setGranting(false);
    }
  }

  async function handleRevoke(userId: string) {
    setRevokingUserId(userId);

    try {
      await revokeAccess(userId);

      message.success("دسترسی با موفقیت لغو شد.");

      await loadGrants();
    } catch (error) {
      const data = getApiErrorData(error);
      message.error(data?.message || "لغو دسترسی انجام نشد.");
    } finally {
      setRevokingUserId(null);
    }
  }

  return (
    <>
      <PageTitle title="دسترسی" />
      <Header />

      <main className="page">
        <div className="page-header">
          <Typography.Title level={2} className="page-title">
            دسترسی‌
          </Typography.Title>

          <Typography.Paragraph className="page-description">
            فروشندگانی که می‌توانند کالاهای شما را ببینند مدیریت کنید.
          </Typography.Paragraph>
        </div>

        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          <Card title="اعطای دسترسی">
            <Space.Compact style={{ width: "100%" }}>
              <Input
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="شماره موبایل فروشنده"
              />

              <Button
                type="primary"
                loading={granting}
                onClick={handleGrant}
              >
                اعطای دسترسی
              </Button>
            </Space.Compact>
          </Card>

          <Card title="فروشندگان دارای دسترسی">
            {loading ? (
              <Spin />
            ) : grants.length === 0 ? (
              <Text type="secondary">
                هنوز به فروشنده‌ای دسترسی نداده‌اید!
              </Text>
            ) : (
              <List
                dataSource={grants}
                renderItem={(grant) => (
                  <List.Item
                    actions={[
                      <Button
                        danger
                        loading={revokingUserId === grant.userId}
                        disabled={
                          revokingUserId !== null &&
                          revokingUserId !== grant.userId
                        }
                        onClick={() => handleRevoke(grant.userId)}
                      >
                        لغو دسترسی
                      </Button>,
                    ]}
                  >
                    <Space direction="vertical" size={0}>
                      <Text strong>{grant.shopName}</Text>

                      <Text type="secondary">
                        {formatMobile(grant.phoneNumber)}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Space>
      </main>
    </>
  );
}