const express = require("express");
const {
    findUserById,
    loginUser,
    registerUser
} = require("../auth/authService");
const {
    TOKEN_COOKIE_NAME,
    buildAuthCookie,
    buildLogoutCookie,
    createToken,
    getCookieValue,
    verifyToken
} = require("../auth/token");

const router = express.Router();

function sendAuthResponse(res, user, statusCode = 200) {
    const token = createToken(user);

    res.setHeader("Set-Cookie", buildAuthCookie(token));
    res.status(statusCode).json({
        success: true,
        user: {
            id: user.id,
            username: user.username
        }
    });
}

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await registerUser(username, password);

        sendAuthResponse(res, user, 201);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Could not register user."
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await loginUser(username, password);

        sendAuthResponse(res, user);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Could not log in."
        });
    }
});

router.post("/logout", (req, res) => {
    res.setHeader("Set-Cookie", buildLogoutCookie());
    res.json({
        success: true,
        message: "Logged out successfully."
    });
});

router.get("/user", async (req, res) => {
    try {
        const token = getCookieValue(req, TOKEN_COOKIE_NAME);
        const payload = verifyToken(token);

        if (!payload) {
            res.status(401).json({
                success: false,
                user: null
            });
            return;
        }

        const user = await findUserById(payload.sub);

        if (!user) {
            res.status(401).json({
                success: false,
                user: null
            });
            return;
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            user: null
        });
    }
});

module.exports = router;
