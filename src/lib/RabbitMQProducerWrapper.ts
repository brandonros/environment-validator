import { RabbitMQWrapper } from './RabbitMQWrapper';

export class RabbitMQProducerWrapper extends RabbitMQWrapper {
    constructor(config = {}) {
        super(config);
    }

    async sendMessage(exchange: string, routingKey: string, message: any) {
        if (!this.channel) {
            throw new Error('Producer is not connected');
        }

        const targetExchange = exchange || this.config.exchange;
        const targetRoutingKey = routingKey || this.config.routingKey;

        try {
            await this.channel.assertExchange(targetExchange, 'direct', { durable: false });
            await this.channel.publish(
                targetExchange,
                targetRoutingKey,
                Buffer.from(typeof message === 'string' ? message : JSON.stringify(message))
            );
            console.log(`Sent message to exchange: ${targetExchange} with routing key: ${targetRoutingKey}`);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }
}
