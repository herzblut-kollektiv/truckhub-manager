// ========================================
// 🚛 TruckHub Manager - Backend Server
// ========================================

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const TwitchStrategy = require('passport-twitch-new').Strategy;
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://herzblut-kollektiv.github.io',
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'truckhub_super_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.set('trust proxy', 1);
app.use(passport.initialize());
app.use(passport.session());

// ========== PASSPORT ==========
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ========== DISCORD STRATEGY ==========
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: '/auth/discord/callback',
    scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.username,
        avatar: profile.avatar 
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : `https://ui-avatars.com/api/?name=${profile.username}&background=5865F2&color=fff`,
        email: profile.email,
        provider: 'discord',
        role: 'ceo'
    };
    return done(null, user);
}));

// ========== TWITCH STRATEGY ==========
passport.use(new TwitchStrategy({
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    callbackURL: '/auth/twitch/callback',
    scope: 'user:read:email'
}, (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.display_name || profile.login,
        avatar: profile.profile_image_url || `https://ui-avatars.com/api/?name=${profile.login}&background=9146FF&color=fff`,
        email: profile.email,
        provider: 'twitch',
        role: 'ceo'
    };
    return done(null, user);
}));

// ========== AUTH ROUTES ==========

// Discord
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { 
        failureRedirect: process.env.FRONTEND_URL + '/?error=discord_failed' 
    }),
    (req, res) => {
        const userData = encodeURIComponent(JSON.stringify(req.user));
        res.redirect(`${process.env.FRONTEND_URL}/?login=success&user=${userData}`);
    }
);

// Twitch
app.get('/auth/twitch', passport.authenticate('twitch'));

app.get('/auth/twitch/callback',
    passport.authenticate('twitch', { 
        failureRedirect: process.env.FRONTEND_URL + '/?error=twitch_failed' 
    }),
    (req, res) => {
        const userData = encodeURIComponent(JSON.stringify(req.user));
        res.redirect(`${process.env.FRONTEND_URL}/?login=success&user=${userData}`);
    }
);

// Logout
app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect(process.env.FRONTEND_URL);
    });
});

// User Info
app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ success: true, user: req.user });
    } else {
        res.json({ success: false, user: null });
    }
});

// ========== HOME ROUTE ==========
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>TruckHub Backend</title></head>
        <body style="font-family:Arial;background:#1a1a2e;color:#4CAF50;text-align:center;padding:50px;">
            <h1>🚛 TruckHub Manager Backend</h1>
            <p>✅ Server läuft!</p>
            <p style="color:#888;">Frontend: <a href="${process.env.FRONTEND_URL}" style="color:#4CAF50;">${process.env.FRONTEND_URL}</a></p>
            <hr style="border-color:#333;margin:30px 0;">
            <p>🔗 Auth Routes:</p>
            <ul style="list-style:none;">
                <li><a href="/auth/discord" style="color:#5865F2;">Discord Login</a></li>
                <li><a href="/auth/twitch" style="color:#9146FF;">Twitch Login</a></li>
            </ul>
        </body>
        </html>
    `);
});

// ========== SERVER START ==========
app.listen(PORT, () => {
    console.log(`🚛 TruckHub Backend läuft auf Port ${PORT}`);
});
