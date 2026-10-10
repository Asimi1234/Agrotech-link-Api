const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/user.model');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const emailEntry = profile.emails && profile.emails[0];
        const email = emailEntry && emailEntry.value && emailEntry.value.toLowerCase();
        const verified =
          profile._json &&
          (profile._json.email_verified === true || profile._json.email_verified === 'true');

        if (!email || !verified) {
          return done(null, false, { message: 'Google email is not verified', code: 403 });
        }

        const existing = await User.findOne({ googleId: profile.id });
        if (existing) {
          return done(null, existing);
        }

        const emailOwner = await User.findOne({ email });
        if (emailOwner) {
          return done(null, false, {
            message: 'Email already registered to another account',
            code: 409
          });
        }

        const username = (profile.displayName || email.split('@')[0]).trim().slice(0, 50);
        const user = await User.create({ googleId: profile.id, email, username, role: 'buyer' });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
