import type {Pool} from 'pg';
import type {
    DBChat,
    DBCreateChat,
    DBCreateMessage,
    DBCreateUser,
    DBMessage,
    DBUser,
} from "../../models/db";
import type {IDatabaseResource} from "../types";

export class UserSqlResource implements IDatabaseResource<DBUser, DBCreateUser> {
    pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(data: DBCreateUser): Promise<DBUser> {
        // seperating query and values prevents sql injection
        const query = `INSERT INTO "user" (name, email, password)
                       VALUES ($1, $2, $3)
                       RETURNING *`;
        const values = [data.name, data.email, data.password];
        const result = await this.pool.query(query, values);
        return result.rows[0] as DBUser;
    }

    async delete(id: string): Promise<DBUser | null> {
        const query = `DELETE
                       FROM "user"
                       WHERE id = $1
                       RETURNING *`;
        const values = [id];
        const results = await this.pool.query(query, values);
        return results.rowCount ?? 0 > 0 ? (results.rows[0] as DBUser) : null;
    }

    async get(id: string): Promise<DBUser | null> {
        const query = `SELECT *
                       FROM "user"
                       WHERE id = $1`;
        const values = [id];
        const results = await this.pool.query(query, values);
        return results.rowCount ?? 0 > 0 ? (results.rows[0] as DBUser) : null;
    }

    async find(data: Partial<DBUser>): Promise<DBUser | null> {
        return this.findByFields(data, false);
    }

    async findAll(data: Partial<DBUser>): Promise<DBUser[] | null> {
        return this.findByFields(data, true);
    }

    private async findByFields<T extends (DBUser | null) | DBUser[]>(
        data: Partial<DBUser>,
        all: boolean = false
    ): Promise<T> {
        const fields: string[] = [];
        const values: unknown[] = [];
        Object.keys(data).forEach((key, index) => {
            console.log(`"${key}" = $${index + 1}`);
            fields.push(`"${key}" = $${index + 1}`);
            values.push(data[key as keyof DBUser]);
        });
        const whereClause = fields.length > 0 ? `WHERE ${fields.join(" AND ")}` : "";
        const query = `SELECT *
                       FROM \"user\" ${whereClause}`;
        const result = await this.pool.query(query, values);
        return all ? (result.rows as T) : result.rowCount ?? 0 > 0 ?
            (result.rows[0] as T) :
            null as T;
    }

    async update(id: string, data: Partial<DBUser>): Promise<DBUser | null> {
        const fields: string[] = [];
        const values = [];
        Object.keys(data).forEach((key, index) => {
            fields.push(`"${key}" = $${index + 1}`);
            values.push(data[key as keyof DBUser]);
        });
        values.push(id); // id as last parameter (for where)
        const setClause = fields.join(", ");
        const query = `UPDATE \"user\"
                       SET ${setClause}
                       WHERE id = $${fields.length + 1}
                       RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rowCount ?? 0 > 0 ? (result.rows[0] as DBUser): null;
    }
}
