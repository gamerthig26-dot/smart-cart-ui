const bcrypt = require("bcrypt");
const { get, run } = require("../database/database");

const SALT_ROUNDS = 12;

function normalizeUsername(username) {
    return String(username || "").trim().toLowerCase();
}

function validateCredentials(username, password) {
    if (!String(username || "").trim() || !String(password || "").trim()) {
        return "Username and password are required.";
    }

    if (String(username).trim().length < 3) {
        return "Username must have at least 3 characters.";
    }

    if (String(password).length < 6) {
        return "Password must have at least 6 characters.";
    }

    return "";
}

async function findUserByUsername(username) {
    return get(
        "SELECT id, username, password, created_at FROM users WHERE username = ?",
        [normalizeUsername(username)]
    );
}

async function findUserById(id) {
    return get(
        "SELECT id, username, created_at FROM users WHERE id = ?",
        [id]
    );
}

async function registerUser(username, password) {
    const validationError = validateCredentials(username, password);

    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    const normalizedUsername = normalizeUsername(username);
    const existingUser = await findUserByUsername(normalizedUsername);

    if (existingUser) {
        const error = new Error("This username is already registered.");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [normalizedUsername, hashedPassword]
    );

    return {
        id: result.id,
        username: normalizedUsername
    };
}

async function loginUser(username, password) {
    if (!String(username || "").trim() || !String(password || "").trim()) {
        const error = new Error("Username and password are required.");
        error.statusCode = 400;
        throw error;
    }

    const user = await findUserByUsername(username);

    if (!user) {
        const error = new Error("Invalid username or password.");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        const error = new Error("Invalid username or password.");
        error.statusCode = 401;
        throw error;
    }

    return {
        id: user.id,
        username: user.username,
        created_at: user.created_at
    };
}

module.exports = {
    findUserById,
    loginUser,
    registerUser
};
