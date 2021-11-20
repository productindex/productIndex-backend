import { User } from "../../user/userType";
const { authenticateToken } = require('./userAuthorization')
import { AppError } from '../../../utils/appError.js';
import { create } from "domain";

export { };
const bcrypt = require('bcrypt')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const userService = require('../../user/userService')
let refreshTokens: any = []
const { checkNotAuthenticated } = require('./userAuthorization')
const crypto = require('crypto')

const systemRoleService = require('./systemRole/systemRoleService')

// Works with database
router.post('/auth/register', checkNotAuthenticated, async (req: any, res: any) => {
    try {
        const hashedPass = await bcrypt.hash(req.body.password, 10)
        const user: User = {
            id: 1,
            role_id: await systemRoleService.getRoleId('USER'),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email_address: req.body.email_address,
            password: hashedPass,
            dob: '',
            insert_date: Date.now(),
            active: true,
            is_verified: false

        }
        const newUser = await userService.createUser(user)

        return res.status(200).json({email_address: newUser.email_address})
    }
    catch (err: any) {
        return res.status(400).json({ error: err.message })
    }

});
// Works with database
router.post('/auth/login', checkNotAuthenticated, async (req, res) => {
    try {
        const user = await userService.getUserByEmail(req.body.email_address)
        await bcrypt.compare(req.body.password, user.password, (err, resp) => {
            if (err) res.status(404)
            if (resp) {
                const accessToken = generateAccessToken({ user_id: user.id })
                const refreshToken = jwt.sign({ user_id: user.id }, process.env.REFRESH_TOKEN_SECRET)
                refreshTokens.push(refreshToken)
                return res.status(200).json({ access_token: accessToken, refresh_token: refreshToken })
            }
            return res.status(400).json({ "error": "Email address or password is incorrect" })
        })

    }
    catch (e: any) {
        return res.status(200).json({ "error": e.message })
    }
})

router.delete('/auth/logout', authenticateToken, (req: any, res: any) => {

    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
});

// Works with database
router.post('/auth/forgot-password', checkNotAuthenticated, async (req: any, res: any) => {
    try {
        let user: User = await userService.getUserByEmail(req.body.email_address)

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        const userResetTokenExpiry = Date.now() * 10 * 60 * 1000;

        userService.updateResetToken(user.email_address, hashedResetToken, userResetTokenExpiry);

        return res.status(200).json({ reset_token: resetToken, reset_token_expires: userResetTokenExpiry })
    }
    catch (err: any) {
        return res.status(400).json({ "error": err.message })
    }

});
// Works with database
router.post('/auth/reset-password/:resetToken', checkNotAuthenticated, async (req: any, res: any) => {
    try {
        const resetToken = req.params.resetToken
        // Should check if we're saving and getting an encrypted resetToken from the database for comparison
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        const user: User = await userService.getUserByResetToken(hashedToken)

        const newPassword = req.body.password
        const newPasswordConfirm = req.body.password_confirm
        if (user) {
            if (user.password_reset_expires_in && user.password_reset_expires_in < Date.now()) {
                res.status(400).json({ "error": "Token expired" })
            }
            await userService.updatePassword(user.id, user.email_address, newPassword, newPasswordConfirm)

            return res.status(200).send('success')
        }

        return res.status(400).json({ error: 'Invalid token' })
    }
    catch (e: any) {
        return res.status(400).send(e.message)
    }
});


router.post('/auth/token', (req, res) => {
    const refreshToken = req.body.refresh_token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ user_id: user.user_id })
        return res.json({ access_token: accessToken })
    })
})

function generateAccessToken(user) {
    // expiration time should be 15m in prod
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.NODE_ENV == 'development' ? '1440m' : '15m' })
}

function validUserRefreshToken(userId, refreshToken): Boolean {
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const found = userService.validUserRefreshToken(userId, hashedRefreshToken)
    if (found) return true

    return false
}
module.exports = router