const result = require("dotenv").config();
const fs = require('fs');
const path = require('path');

console.log("Running debug-env.js");
console.log("CWD:", process.cwd());
console.log("Path to .env:", path.resolve(process.cwd(), '.env'));
console.log(".env exists?", fs.existsSync(path.resolve(process.cwd(), '.env')));

if (result.error) {
    console.error("Dotenv Error:", result.error);
} else {
    console.log("Dotenv Parsed Keys:", Object.keys(result.parsed || {}));
}

console.log("ENV JWT_SECRET:", process.env.JWT_SECRET ? "DEFINED" : "UNDEFINED");
console.log("ENV MICROSOFT_CLIENT_ID:", process.env.MICROSOFT_CLIENT_ID ? "DEFINED" : "UNDEFINED");
