import {Hono} from 'hono';
import {logger} from 'hono/logger';
import {timing} from "hono/timing";
import {showRoutes} from "hono/dev";
import type {ContextVariables} from "../constants";
import {API_PREFIX} from "../constants";
import {attachUserId, checkJWTAuth} from "../middlewares/auth";
import { cors } from "hono/cors";
import type {
    DBChat,
    DBCreateChat,
    DBCreateMessage,
    DBCreateUser,
    DBMessage,
    DBUser
} from "../models/db";
import {SimpleInMemoryResource} from "../storage/inmemory";
import {AUTH_PREFIX, createAuthApp} from "./auth";
import {CHAT_PREFIX, createChatApp} from "./chat";
import {rateLimitMiddleware} from "../middlewares/rateLimiting";
import {cacheMiddleware} from "../middlewares/caching";
import { Pool } from 'pg';
import { UserSqlResource } from "../storage/sql/user";
import { ChatSqlResource } from "../storage/sql/chat";
import { MessageSqlResource } from "../storage/sql/message";

const corsOptions = {
    origin: [ Bun.env.CORS_ORIGIN as string ],
    allowMethods: [ "GET", "POST", "PUT", "DELETE", "PATCH" ],
    allowHeaders: [ "Authorization", "Content-Type" ],
    maxAge: 86400,
};

export function createSQLApp() {
    const pool = new Pool({
        connectionString: Bun.env.DB_URL,
    });
    return createMainApp(
        createAuthApp(new UserSqlResource(pool)),
        createChatApp(new ChatSqlResource(pool), new MessageSqlResource(pool)),
    );
}

export function createMainApp(authApp: Hono<ContextVariables>, chatApp: Hono<ContextVariables>) {
    const app = new Hono<ContextVariables>().basePath(API_PREFIX);
    app.use("*", logger());
    app.use("*", timing());
    app.use("*", checkJWTAuth);
    app.use("*", attachUserId);
    app.use("*", rateLimitMiddleware);
    app.use("*", cors(corsOptions));
    app.use('*', cacheMiddleware());

    app.route(AUTH_PREFIX, authApp);
    app.route(CHAT_PREFIX, chatApp);

    showRoutes(app);
    return app;
}

export function createInMemoryApp() {
    return createMainApp(
        createAuthApp(new SimpleInMemoryResource<DBUser, DBCreateUser>()),
        createChatApp(new SimpleInMemoryResource<DBChat, DBCreateChat>(),
            new SimpleInMemoryResource<DBMessage, DBCreateMessage>(),
        ),
    );
}

