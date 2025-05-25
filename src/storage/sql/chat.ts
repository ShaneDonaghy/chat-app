import type {Pool} from 'pg';
import type {
    DBChat,
    DBCreateChat
} from "../../models/db";
import type {IDatabaseResource} from "../types";

export class ChatSqlResource implements IDatabaseResource<DBChat, DBCreateChat> {
    pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(data: DBCreateChat): Promise<DBChat> {
        // seperating query and values prevents sql injection
        const query = `INSERT INTO "chat" (ownerId, name)
                       VALUES ($1, $2)
                       RETURNING *`;
        const values = [data.ownerId, data.name];
        const result = await this.pool.query(query, values);
        return result.rows[0] as DBChat
    }

    async delete(id: string): Promise<DBChat | null> {
        const query = `DELETE
                       FROM "chat"
                       WHERE id = $1
                       RETURNING *`;
        const values = [id];
        const results = await this.pool.query(query, values);
        return results.rowCount ?? 0 > 0 ? (results.rows[0] as DBChat) : null;
    }

    async get(id: string): Promise<DBChat | null> {
        const query = `SELECT *
                       FROM "chat"
                       WHERE id = $1`;
        const values = [id];
        const results = await this.pool.query(query, values);
        return results.rowCount ?? 0 > 0 ? (results.rows[0] as DBChat) : null;
    }

    async find(data: Partial<DBChat>): Promise<DBChat | null> {
        return this.findByFields(data, false);
    }

    async findAll(data: Partial<DBChat>): Promise<DBChat[] | null> {
        return this.findByFields(data, true);
    }

    private async findByFields<T extends (DBChat | null) | DBChat[]>(
        data: Partial<DBChat>,
        all: boolean = false
    ): Promise<T> {
        const fields: string[] = [];
        const values: unknown[] = [];
        Object.keys(data).forEach((key, index) => {
            console.log(`"${key}" = $${index + 1}`);
            fields.push(`"${key}" = $${index + 1}`);
            values.push(data[key as keyof DBChat]);
        });
        const whereClause = fields.length > 0 ? `WHERE ${fields.join(" AND ")}` : "";
        const query = `SELECT *
                       FROM \"chat\" ${whereClause}`;
        const result = await this.pool.query(query, values);
        return all ? (result.rows as T) : result.rowCount ?? 0 > 0 ?
            (result.rows[0] as T) :
            null as T;
    }

    async update(id: string, data: Partial<DBChat>): Promise<DBChat | null> {
        const fields: string[] = [];
        const values = [];
        Object.keys(data).forEach((key, index) => {
            fields.push(`"${key}" = $${index + 1}`);
            values.push(data[key as keyof DBChat]);
        });
        values.push(id); // id as last parameter (for where)
        const setClause = fields.join(", ");
        const query = `UPDATE \"chat\"
                       SET ${setClause}
                       WHERE id = $${fields.length + 1}
                       RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rowCount ?? 0 > 0 ? (result.rows[0] as DBChat): null;
    }
}
