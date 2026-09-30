export function getProfileCompleted(token: string | null): boolean {
    if (!token) {
        return false;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]),);

        return payload.profileCompleted === 'true';
    } catch {
        return false;
    }
}