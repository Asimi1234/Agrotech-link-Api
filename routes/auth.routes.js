const express = require('express');
const passport = require('../config/passport');
const { getMe, logout } = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Google OAuth sign-in and session
 */

/**
 * @openapi
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Start Google sign-in
 *     description: Redirects to Google's consent screen (scopes profile, email).
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], state: true }));

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google sign-in callback
 *     description: Completes sign-in and returns the authenticated user.
 *     responses:
 *       200:
 *         description: Authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Google email not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already registered to another account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const code = (info && info.code) || 401;
      return res.status(code).json({ message: (info && info.message) || 'Authentication failed' });
    }
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        return next(regenErr);
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        req.session.save((saveErr) => {
          if (saveErr) {
            return next(saveErr);
          }
          res.status(200).json(user);
        });
      });
    });
  })(req, res, next);
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not signed in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', getMe);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out and destroy the session
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', logout);

module.exports = router;
