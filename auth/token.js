const crypto = require("crypto");

const TOKEN_COOKIE_NAME = "smart_cart_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const TOKEN_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || "replace-this-secret-before-deployment";

function base64UrlEncode(value) {
    return Buffer.from(JSON.stringify(value))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function base64UrlDecode(value) {
    const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
    const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8"));
}

function sign(input) {
    return crypto
        .createHmac("sha256", TOKEN_SECRET)
        .update(input)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function createToken(user) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: user.id,
        username: user.username,
        iat: now,
        exp: now + TOKEN_MAX_AGE_SECONDS
    };

    const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;
    return `${unsignedToken}.${sign(unsignedToken)}`;
}

function verifyToken(token) {
    if (!token) {
        return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
        return null;
    }

    const unsignedToken = `${parts[0]}.${parts[1]}`;
    const expectedSignature = sign(unsignedToken);
    const providedSignature = parts[2];

    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(providedSignature);

    if (
        expectedBuffer.length !== providedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
        return null;
    }

    const payload = base64UrlDecode(parts[1]);

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
    }

    return payload;
}

function getCookieValue(req, cookieName) {
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    const cookie = cookies.find((item) => item.startsWith(`${cookieName}=`));

    if (!cookie) {
        return "";
    }

    return decodeURIComponent(cookie.slice(cookieName.length + 1));
}

function buildAuthCookie(token) {
    const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";

    return [
        `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}`,
        "HttpOnly",
        "SameSite=Lax",
        "Path=/",
        `Max-Age=${TOKEN_MAX_AGE_SECONDS}`,
        secureFlag.replace(/^; /, "")
    ].filter(Boolean).join("; ");
}

function buildLogoutCookie() {
    return `${TOKEN_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

module.exports = {
    TOKEN_COOKIE_NAME,
    createToken,
    verifyToken,
    getCookieValue,
    buildAuthCookie,
    buildLogoutCookie
};
