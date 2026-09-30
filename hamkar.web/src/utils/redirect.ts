export function getRedirectUrl(
    searchParams: URLSearchParams,
) {
    return searchParams.get("redirect") || "/";
}

export function buildRedirectUrl(
    path: string,
    redirectUrl: string,
) {
    return `${path}?redirect=${encodeURIComponent(redirectUrl)}`;
}