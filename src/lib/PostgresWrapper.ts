import { Pool } from 'pg'

export class PostgresWrapper {
    private pool: Pool
    
    constructor() {
        this.pool = new Pool({
            host: 'debian-k3s',
            port: 5432,
            user: 'postgres',
            password: 'postgres123',
            database: 'postgres'
        })
    }

    async query(sql: string, params?: any[]) {
        const result = await this.pool.query(sql, params)
        return result.rows
    }
}
