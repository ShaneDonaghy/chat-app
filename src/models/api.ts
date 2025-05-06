import type {
    DBUser,
    DBChat,
    DBMessage,
    DBCreateUser,
    DBCreateChat,
    DBCreateMessage
} from "./db";

export type APICreateUser = DBCreateUser;
export type APIUser = Omit<DBUser, "password">;
export type APICreateChat = DBCreateChat;
export type APIChat = DBChat;
export type APICreateMessage = DBCreateMessage;
export type APIMessage = DBMessage;
