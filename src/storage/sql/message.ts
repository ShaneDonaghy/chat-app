import type {Pool} from 'pg';
import type {
    DBCreateMessage,
    DBMessage
} from "../../models/db";
import type {IDatabaseResource} from "../types";

export class MessageSqlResource implements IDatabaseResource<DBMessage, DBCreateMessage> {
    pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(data: DBCreateMessage): Promise<DBMessage> {
        // seperating query and values prevents sql injection
        const query = `INSERT INTO "message" (chatId, type, message)
                       VALUES ($1, $2, $3)
                       RETURNING *`;
        const values = [data.chatId, data.type, data.message];
        const result = await this.pool.query(query, values);
        return result.rows[0] as DBMessage;
    }

    async delete(id: string): Promise<DBMessage | null> {
        const query = `DELETE
                       FROM "message"
                       WHERE id = $1
                       RETURNING *`;
        const values = [id];
        const results = await this.pool.query(query, values);
        return results.rowCount ?? 0 > 0 ? (results.rows[0] as DBMessage) : null;
    }

    async get(id: string): Promise<DBMessage | null> {
        const query = `SELECT *
                       FROM "message"
                       WHERE id = $1`;
        const values = [id];
        const results = await this.pool.query(query, values);
        return results.rowCount ?? 0 > 0 ? (results.rows[0] as DBMessage) : null;
    }

    async find(data: Partial<DBMessage>): Promise<DBMessage | null> {
        return this.findByFields(data, false);
    }

    async findAll(data: Partial<DBMessage>): Promise<DBMessage[] | null> {
        return this.findByFields(data, true);
    }

    private async findByFields<T extends (DBMessage | null) | DBMessage[]>(
        data: Partial<DBMessage>,
        all: boolean = false
    ): Promise<T> {
        const fields: string[] = [];
        const values: unknown[] = [];
        Object.keys(data).forEach((key, index) => {
            console.log(`"${key}" = $${index + 1}`);
            fields.push(`"${key}" = $${index + 1}`);
            values.push(data[key as keyof DBMessage]);
        });
        const whereClause = fields.length > 0 ? `WHERE ${fields.join(" AND ")}` : "";
        const query = `SELECT *
                       FROM \"message\" ${whereClause}`;
        const result = await this.pool.query(query, values);
        return all ? (result.rows as T) : result.rowCount ?? 0 > 0 ?
            (result.rows[0] as T) :
            null as T;
    }

    async update(id: string, data: Partial<DBMessage>): Promise<DBMessage | null> {
        const fields: string[] = [];
        const values = [];
        Object.keys(data).forEach((key, index) => {
            fields.push(`"${key}" = $${index + 1}`);
            values.push(data[key as keyof DBMessage]);
        });
        values.push(id); // id as last parameter (for where)
        const setClause = fields.join(", ");
        const query = `UPDATE \"message\"
                       SET ${setClause}
                       WHERE id = $${fields.length + 1}
                       RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rowCount ?? 0 > 0 ? (result.rows[0] as DBMessage): null;
    }
}
