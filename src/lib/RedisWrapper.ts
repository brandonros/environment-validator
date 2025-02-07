import { createClient, RedisClientType } from 'redis'

export class RedisWrapper {
    private client: RedisClientType
    
    constructor() {
        this.client = createClient({
            url: 'redis://debian-k3s:6379'
        })

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err)
        })
    }

    async connect() {
        try {
            await this.client.connect()
            return this
        } catch (error) {
            console.error('Redis Connection Error:', error)
            throw error
        }
    }

    async disconnect() {
        await this.client.disconnect()
    }

    async get(key: string) {
        return await this.client.get(key)
    }

    async set(key: string, value: string) {
        return await this.client.set(key, value)
    }
}
