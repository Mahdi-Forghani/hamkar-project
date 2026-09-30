import { useEffect, useState } from "react";
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

type TouchedFields = {
    firstName: boolean;
    lastName: boolean;
    shopName: boolean;
    address: boolean;
};

export default function ProfilePage() {
    const [searchParams] =
        useSearchParams();

    const redirectUrl =
        searchParams.get("redirect") || "/";

    const navigate = useNavigate();

    const {
        getProfile,
        updateProfile,
    } = useAuth();

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [shopName, setShopName] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [touched, setTouched] =
        useState<TouchedFields>({
            firstName: false,
            lastName: false,
            shopName: false,
            address: false,
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const profile =
                    await getProfile();

                setFirstName(
                    profile.firstName ?? "",
                );

                setLastName(
                    profile.lastName ?? "",
                );

                setShopName(
                    profile.shopName ?? "",
                );

                setAddress(
                    profile.address ?? "",
                );
            } catch (error) {
                const data =
                    getApiErrorData(error);

                message.error(
                    data?.message ||
                        "دریافت اطلاعات پروفایل انجام نشد.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [getProfile]);

    const isValid =
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        shopName.trim().length > 0 &&
        address.trim().length > 0;

    function markTouched(
        field: keyof TouchedFields,
    ) {
        setTouched((current) => ({
            ...current,
            [field]: true,
        }));
    }

    function validateField(
        value: string,
        field: keyof TouchedFields,
    ) {
        return (
            touched[field] &&
            value.trim().length === 0
        );
    }

    function handleSubmit() {
        if (!isValid) {
            setTouched({
                firstName: true,
                lastName: true,
                shopName: true,
                address: true,
            });

            return;
        }

        saveProfile();
    }

    async function saveProfile() {
        setSaving(true);

        try {
            await updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                shopName: shopName.trim(),
                address: address.trim(),
            });

            message.success(
                "اطلاعات پروفایل با موفقیت ثبت شد.",
            );

            navigate(redirectUrl, {
                replace: true,
            });
        } catch (error) {
            const data =
                getApiErrorData(error);

            message.error(
                data?.message ||
                    "ثبت اطلاعات پروفایل انجام نشد.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <PageTitle title="پروفایل" />

            <AuthLayout>
                <div className="profile-content">
                    <Title
                        level={3}
                        className="profile-title"
                    >
                        تکمیل پروفایل
                    </Title>

                    <Text
                        type="secondary"
                        className="profile-description"
                    >
                        اطلاعات پروفایل خود را وارد کنید
                    </Text>

                    <div className="profile-form">
                        <div className="profile-field">
                            <label>
                                نام
                                <span>*</span>
                            </label>

                            <Input
                                value={firstName}
                                onChange={(e) =>
                                    setFirstName(
                                        e.target.value,
                                    )
                                }
                                onBlur={() =>
                                    markTouched(
                                        "firstName",
                                    )
                                }
                                placeholder="نام خود را وارد کنید"
                                disabled={loading}
                                status={
                                    validateField(
                                        firstName,
                                        "firstName",
                                    )
                                        ? "error"
                                        : ""
                                }
                            />

                            {validateField(
                                firstName,
                                "firstName",
                            ) && (
                                <div className="profile-error">
                                    وارد کردن نام الزامی است
                                </div>
                            )}
                        </div>

                        <div className="profile-field">
                            <label>
                                نام خانوادگی
                                <span>*</span>
                            </label>

                            <Input
                                value={lastName}
                                onChange={(e) =>
                                    setLastName(
                                        e.target.value,
                                    )
                                }
                                onBlur={() =>
                                    markTouched(
                                        "lastName",
                                    )
                                }
                                placeholder="نام خانوادگی خود را وارد کنید"
                                disabled={loading}
                                status={
                                    validateField(
                                        lastName,
                                        "lastName",
                                    )
                                        ? "error"
                                        : ""
                                }
                            />

                            {validateField(
                                lastName,
                                "lastName",
                            ) && (
                                <div className="profile-error">
                                    وارد کردن نام خانوادگی الزامی است
                                </div>
                            )}
                        </div>

                        <div className="profile-field">
                            <label>
                                نام فروشگاه
                                <span>*</span>
                            </label>

                            <Input
                                value={shopName}
                                onChange={(e) =>
                                    setShopName(
                                        e.target.value,
                                    )
                                }
                                onBlur={() =>
                                    markTouched(
                                        "shopName",
                                    )
                                }
                                placeholder="نام فروشگاه خود را وارد کنید"
                                disabled={loading}
                                status={
                                    validateField(
                                        shopName,
                                        "shopName",
                                    )
                                        ? "error"
                                        : ""
                                }
                            />

                            {validateField(
                                shopName,
                                "shopName",
                            ) && (
                                <div className="profile-error">
                                    وارد کردن نام فروشگاه الزامی است
                                </div>
                            )}
                        </div>

                        <div className="profile-field">
                            <label>
                                آدرس
                                <span>*</span>
                            </label>

                            <Input.TextArea
                                value={address}
                                onChange={(e) =>
                                    setAddress(
                                        e.target.value,
                                    )
                                }
                                onBlur={() =>
                                    markTouched(
                                        "address",
                                    )
                                }
                                placeholder="آدرس خود را وارد کنید"
                                autoSize={{
                                    minRows: 2,
                                    maxRows: 4,
                                }}
                                disabled={loading}
                                status={
                                    validateField(
                                        address,
                                        "address",
                                    )
                                        ? "error"
                                        : ""
                                }
                            />

                            {validateField(
                                address,
                                "address",
                            ) && (
                                <div className="profile-error">
                                    وارد کردن آدرس الزامی است
                                </div>
                            )}
                        </div>

                        <Button
                            type="primary"
                            block
                            loading={saving}
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            ثبت اطلاعات
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        </>
    );
}