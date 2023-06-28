const express = require("express");
const { getLoggedInUserId } = require("../utils");
const db = require("../db");

const router = express.Router();

/**
 * Get the id and username of currently logged in user, if any
 */

router.get("/get_my_info", async (req, res, next) => {
    try {
        const userId = getLoggedInUserId(req);
        console.log(`Your userID is ${userId}`);
        let result;
        if (userId != null) {
            const userObject = await db.getUserRecord(userId);
            if (userObject == null) {
                // This probably means cookies are messed up
                res.clearCookie("signedInUser");
                res.json({ userInfo: null });
                return;
            } else {
                result = { id: userObject.id, username: userObject.username };
            }
        } else {
            result = null;
        }
        res.json({ userInfo: result })
    } catch(error) {
        next(error);
    }
})

module.exports = router;