import {Hono} from 'hono';
import type {ContextVariables} from "../constants";
import type {
    DBChat,
    DBCreateChat,
    DBCreateMessage,
    DBMessage,
} from "../models/db";
import type {IDatabaseResource} from "../storage/types";
import {z} from "zod";
import {zValidator} from "@hono/zod-validator";

export const CHAT_PREFIX = "/chat/";
export const CHAT_ROUTE = "";
export const CHAT_MESSAGES_ROUTE = ":id/message/";

export function createChatApp(
    chatResource: IDatabaseResource<DBChat, DBCreateChat>,
    messageResource: IDatabaseResource<DBMessage, DBCreateMessage>,
) {
    const chatApp = new Hono<ContextVariables>();

    chatApp.post(CHAT_ROUTE, zValidator("json", chatSchema), async (c) => {
        const userId = c.get("userId");
        const {name} = await c.req.json();
        const data = await chatResource.create({
            name,
            ownerId: userId,
        });
        c.get("cache").clearPath(c.req.path);
        return c.json({data})
    });
    chatApp.get(CHAT_ROUTE, async (c) => {
        const userId = c.get("userId");
        const data = await chatResource.findAll({ownerId: userId});
        const res = { data };
        c.get("cache").cache(res);
        return c.json({data});
    });
    chatApp.get(CHAT_MESSAGES_ROUTE, zValidator("param", idSchema), async (c) => {
        const chatId = c.req.valid("param");
        const data = await messageResource.findAll(chatId);
        const res = { data };
        c.get("cache").cache(res);
        return c.json({data});
    });
    chatApp.post(CHAT_MESSAGES_ROUTE, zValidator("param", idSchema), zValidator("json", messageSchema), async (c) => {
        const {id: chatId} = c.req.valid("param");
        const { message } = c.req.valid("json");
        const userMessage: DBCreateMessage = {
            message, chatId, type: "system"
        };
        await messageResource.create(userMessage);
        const responseMessage: DBCreateMessage = {
            message: "dummy response",
            chatId,
            type: "system",
        };
        const data = await messageResource.create(responseMessage);
        c.get("cache").clearPath(c.req.path);
        return c.json({data});
    });
    return chatApp;
}

const idSchema = z.object({
    id: z.string().min(1),
});
const chatSchema = z.object({
    name: z.string().min(1),
});
const messageSchema = z.object({
    message: z.string().min(1),
});

