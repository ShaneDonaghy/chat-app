import {afterAll, describe, expect, test} from "bun:test";
import {createPrismaApp} from "../src/controllers/main";
import {resetORMDB} from "./utils";
import {PrismaClient} from "@prisma/client";

describe('chat tests', () => {
    let app = createPrismaApp();
    const prisma = new PrismaClient();

    afterAll(async () => {
        await resetORMDB(prisma);
    });

    async function getToken(email = "test@test.com"): Promise<string> {
        await app.request("api/v1/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: "password123",
                name: "Chat User"
            }),
        });
        const loginResponse = await app.request("api/v1/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: "password123",
            }),
        });
        return (await loginResponse.json()).token;
    }

    async function createChat(token: string) {
        const createChatResponse = await app.request("api/v1/chat/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: "Test Chat"
            }),
        });
        return (await createChatResponse.json()).data.id;
    }

    test("GET /chat/ get user chats (positive)", async () => {
        const token = await getToken('shane@is.cool');
        const chatId = await createChat(token);
        const response = await app.request("api/v1/chat/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        expect(response.status).toBe(200);
        const data = (await response.json()).data;
        expect(data.length).toBe(1);
        expect(data[0].id).toBe(chatId);
    });

    test("GET /chat/ get your chat and not someone elses (negative", async () => {
        const token1 = await getToken('user1@test.com');
        const token2 = await getToken('user2@test.com');
        const chatId1 = await createChat(token1);
        const chatId2 = await createChat(token2);

        const res1 = await app.request("api/v1/chat/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token1}`,
            },
        });
        const chats1 = (await res1.json()).data;
        expect(Array.isArray(chats1)).toBeTruthy();
        expect(chats1[0].id).toBe(chatId1);
        expect(chats1.length).toBe(1);

        const res2 = await app.request("api/v1/chat/", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token2}`,
            },
        });
        const chats2 = (await res2.json()).data;
        expect(Array.isArray(chats2)).toBeTruthy();
        expect(chats2.length).toBe(1);
        expect(chats2[0].id).toBe(chatId2);
        expect(chats1[0].id).not.toBe(chats2[0].id);
    });

    test("POST /chat/:id/message/ create and get chat messages (positive)", async () => {
        const token = await getToken('user1@test.com');
        const chatId = await createChat(token);
        const message = "Hello World";

        await app.request(`api/v1/chat/${chatId}/message/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({message: message}),
        });

        const response = await app.request(`api/v1/chat/${chatId}/message/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        expect(response.status).toBe(200);
        const messages = (await response.json()).data;
        expect(messages.length).toBe(1);
        expect(Array.isArray(messages)).toBeTruthy();
        expect(messages[0].message).toBe(message);
    });

    test("POST /chat/ incorrect chat name (negative)", async () => {
        const token = await getToken('use3@test.com');
        const jsonBody = {
            name: "",
        };
        const response = await app.request(`api/v1/chat/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(jsonBody),
        });
        expect(response.status).toBe(400);
        const responseBodyData = (await response.json());
        expect(responseBodyData).toEqual({
            success: false,
            error: {
                issues: [
                    {
                        code: "too_small",
                        minimum: 1,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: "String must contain at least 1 character(s)",
                        path: [
                            "name"
                        ]
                    }
                ],
                name: "ZodError"
            }
        });
    });

    test("POST /chat/:id/message invalid message (negative)", async () => {
        const token = await getToken('user1@test.com');
        const response = await app.request(`api/v1/chat/a/message/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
        },
            body: JSON.stringify( {} ),
        });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            "success": false,
            "error": {
                "issues": [
                    {
                        "code": "invalid_type",
                        "expected": "string",
                        "received": "undefined",
                        "path": [
                            "message"
                        ],
                        "message": "Required"
                    }
                ],
                "name": "ZodError"
            }
        });
    });

});