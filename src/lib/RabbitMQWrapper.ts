import * as amqp from 'amqplib';

export class RabbitMQWrapper {
    protected connection: amqp.Connection | null;
    protected channel: amqp.Channel | null;
    protected config: any;

    constructor(config: any = {}) {
        this.connection = null;
        this.channel = null;
        this.config = {
            url: config.url || 'amqp://user:rabbitmq123@debian-k3s:5672',
        };
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.config.url);
            this.channel = await this.connection.createChannel();
            
            // Add error handlers
            this.connection.on('error', (err) => {
                console.error('RabbitMQ Connection Error:', err);
            });
            
            this.channel.on('error', (err) => {
                console.error('RabbitMQ Channel Error:', err);
            });
            
            console.log('RabbitMQ connected');
            return this;
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('RabbitMQ disconnected');
        } catch (error) {
            console.error('Failed to disconnect from RabbitMQ:', error);
            throw error;
        }
    }
}
