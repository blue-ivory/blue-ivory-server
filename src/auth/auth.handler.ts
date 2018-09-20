// import * as RedisStore from 'connect-redis';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import { SamlConfig, Strategy as SamlStrategy } from 'passport-saml';
import * as path from 'path';
import { config } from '../config';
import { User } from "../user/user.class";
import { IUser } from "../user/user.interface";

const cookieSession = require('cookie-session');

export class AuthenticationHandler {
    public static init(app: express.Application) {
        app.use(cookieParser());
        app.use(cookieSession({
            keys: ['blue', 'ivory']
        }));
        app.use(session({
            resave: true,
            saveUninitialized: true,
            // store: new RedisStore({
            //     host: config.redis.host,
            //     port: config.redis.port
            // }),
            secret: config.sessionSecret
        }));
        app.use(passport.initialize());
        app.use(passport.session());

        passport.serializeUser(AuthenticationHandler.serializer);
        passport.deserializeUser(AuthenticationHandler.deserializer);

        app.get('/login', AuthenticationHandler.authenticate());
        app.all('/metadata.xml/callback', AuthenticationHandler.authenticate(), AuthenticationHandler.renderUser);
        app.get('/failed', AuthenticationHandler.sendError);
        app.all('/metadata.xml', AuthenticationHandler.sendMetadata);


        passport.use(new SamlStrategy(config.auth.saml as SamlConfig
            , AuthenticationHandler.createUserFromProfile));
    }

    private static authenticate() {
        return passport.authenticate('saml', {
            failureRedirect: '/failed',
            failureFlash: true
        });
    }

    private static async createUserFromProfile(profile, done) {
        let data = {
            id: profile['http://SSO_ENDPOINT/claims/UniqueID'],
            firstName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
            lastName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
            mail: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        }
        try {
            let user = <IUser>await User.findUser(data.id.toLowerCase());
            if (!user) {
                user = <IUser>await User.createUser(data.firstName, data.lastName, data.id.toLowerCase(), data.mail);
            }

            done(null, user);
        } catch (err) {
            done(err);
        }
    }

    private static authenticationMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.url.startsWith("/login") ||
            req.url.startsWith("/metadata.xml/callback") ||
            req.url.startsWith("/failed") ||
            req.user) {
            return next();
        } else {
            return res.redirect('/login');
        }
    }

    private static sendError(req: express.Request, res: express.Response) {
        res.sendStatus(401);
    }

    private static renderUser(req: express.Request, res: express.Response) {
        res.render(path.resolve(__dirname + '/auth.ejs'), { user: req.user });
    }

    private static serializer(user, done) {
        done(null, user.id);
    }

    private static async deserializer(id, done) {
        try {
            let user = <IUser>await User.findUser(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }

    private static sendMetadata(req: express.Request, res: express.Response) {
        res.sendFile(path.resolve(__dirname + '/metadata.xml'));
    }
}