// utils/toPersianDigits.ts

export const toPersianDigits = (
    value: string | number | null | undefined
): string => {
    if (value == null) return "";

    return String(value).replace(
        /\d/g,
        (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]
    );
};

export const formatMobile = (
    value: string | null | undefined
): string => {
    if (!value) return "";

    const digits = value.replace(/\D/g, "");

    const formatted = digits.replace(
        /^(\d{4})(\d{3})(\d{4})$/,
        "$1-$2-$3"
    );

    return toPersianDigits(formatted);
};

export const formatPrice = (
    value: string | number | null | undefined
): string => {
    if (value == null || value === "") return "";

    return new Intl.NumberFormat("fa-IR").format(Number(value));
};