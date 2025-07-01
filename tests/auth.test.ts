import {afterAll, describe, expect, test} from 'bun:test';
import {createPrismaApp} from "../src/controllers/main";
import {resetORMDB} from "./utils";
import {PrismaClient} from "@prisma/client";

describe('Auth', () => {
    let accessToken: string;
    let app = createPrismaApp();
    const prisma = new PrismaClient();

    afterAll(async () => {
        await resetORMDB(prisma);
    });

    test("POST /register (positive)", async () => {
        const jsonBody = {
            email: "test@test.com",
            password: "testpassword",
            name: "Test Name"
        };
        const response = await app.request("api/v1/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonBody),
        });
        expect(response.status).toBe(200);
    });

    test("POST /register (negative - user already exists)", async () => {
        const jsonBody = {
            email: "test@test.com",
            password: "testpassword",
            name: "Test Name"
        };
        const response = await app.request("api/v1/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonBody),
        });
        expect(response.status).toBe(400);
    });

    test("POST /login (positive)", async () => {
        const jsonBody = {
            email: "test@test.com",
            password: "testpassword",
        };
        const response = await app.request("api/v1/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonBody),
        });
        expect(response.status).toBe(200);
        accessToken = (await response.json())["token"];
    });

    test("POST /login (negative - invalid credentials)", async () => {
        const jsonBody = {
            email: "not@real.com",
            password: "notaapassword",
        };
        const response = await app.request("api/v1/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonBody),
        });
        expect(response.status).toBe(401);
    });

    test("GET /chat with no credentials (negative)", async () => {
        const response = await app.request("api/v1/chat/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });
        expect(response.status).toBe(401);
    });

    test("GET /chat with valid credentials (positive)", async () => {
        const response = await app.request("api/v1/chat/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        expect(response.status).toBe(200);
    });

    // validate schema valiations (zod)
    test("POST /register with invalid email (negative)", async () => {
        const jsonBody = {
            email: "noteanemail",
            password: "testpassword",
            name: "Test Name"
        }
        const response = await app.request("api/v1/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonBody)
        });
        expect(response.status).toBe(400);
    });

    test("POST /register with invalid name (negative)", async () => {
        const jsonBody = {
            email: "test@email.com",
            password: "testpassword",
            name: ""
        }
        const response = await app.request("api/v1/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonBody)
        });
        expect(response.status).toBe(400);
    });

    test("POST /register with invalid password (negative)", async () => {
        const jsonBody = {
            email: "test@email.com",
            password: "",
            name: "Test Name"
        }
        const response = await app.request("api/v1/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonBody)
        });
        expect(response.status).toBe(400);
    });

    test("POST /register with everything wrong (negative)", async () => {
        const jsonBody = {
            email: "invalidemail"
        }
        const response = await app.request("api/v1/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonBody),
        });
        expect(await response.json()).toEqual({
            success: false,
            error: {
                issues: [
                    {
                        validation: "email",
                        code: "invalid_string",
                        message: "Invalid email",
                        path: [
                            "email"
                        ]
                    },
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: [
                            "password"
                        ],
                        message: "Required"
                    },
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: [
                            "name"
                        ],
                        message: "Required"
                    }
                ],
                name: "ZodError"
            }
        });
    });


});
