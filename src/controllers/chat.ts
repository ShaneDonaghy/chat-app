import {Hono} from 'hono';
import type {ContextVariables} from "../constants";
import type {
    DBChat,
    DBCreateChat,
    DBCreateMessage,
    DBMessage,
} from "../models/db";
import type {IDatabaseResource} from "../storage/types";

export const CHAT_PREFIX = "/chat/";
export const CHAT_ROUTE = "";
export const CHAT_MESSAGES_ROUTE = ":id/message/";

export function createChatApp(
    chatResource: IDatabaseResource<DBChat, DBCreateChat>,
    messageResource: IDatabaseResource<DBMessage, DBCreateMessage>,
) {
    const chatApp = new Hono<ContextVariables>();
    chatApp.post(CHAT_ROUTE, async (c) => {
        const userId = c.get("userId");
        const {name} = await c.req.json();
        const data = await chatResource.create({
            name,
            ownerId: userId,
        });
        return c.json({data})
    });
    chatApp.get(CHAT_ROUTE, async (c) => {
        const userId = c.get("userId");
        const data = await chatResource.findAll({ownerId: userId});
        return c.json({data});
    });
    chatApp.get(CHAT_MESSAGES_ROUTE, async (c) => {
        const chatId = c.req.param("id");
        const data = await messageResource.findAll({chatId});
        return c.json({data});
    });
    chatApp.post(CHAT_MESSAGES_ROUTE, async (c) => {
        const {id: chatId} = c.req.param();
        const {message} = await c.req.json();
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
        return c.json({data});
    });
    return chatApp;
}
