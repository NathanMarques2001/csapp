require("dotenv").config();

const secret = process.env.JWT_SECRET || "default_secret_legacy_unsafe_for_production";

const microsoft = {
    identityMetadata: process.env.MICROSOFT_IDENTITY_METADATA,
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    responseType: process.env.MICROSOFT_RESPONSE_TYPE,
    responseMode: process.env.MICROSOFT_RESPONSE_MODE,
    redirectUrl: process.env.MICROSOFT_REDIRECT_URL,
    allowHttpForRedirectUrl: process.env.MICROSOFT_ALLOW_HTTP_FOR_REDIRECT_URL === "true",
    scope: process.env.MICROSOFT_SCOPE ? process.env.MICROSOFT_SCOPE.split(",") : [],
};

if (!process.env.JWT_SECRET) {
    console.warn("[Auth Config] WARN: JWT_SECRET not set. Using unsafe default.");
}

module.exports = {
    secret,
    microsoft,
};
