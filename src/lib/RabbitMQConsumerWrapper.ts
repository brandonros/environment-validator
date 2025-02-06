import { RabbitMQWrapper } from './RabbitMQWrapper';
import { Channel, Message } from 'amqplib';

type MessageHandler = (
    content: any, 
    ack: () => void,
    nack: () => void
) => Promise<void>;

export class RabbitMQConsumerWrapper extends RabbitMQWrapper {
    constructor(config = {}) {
        super(config);
    }

    async subscribe(messageHandler: MessageHandler, queue?: string, exchange?: string, routingKey?: string) {
        if (!this.channel) {
            throw new Error('Consumer is not connected');
        }

        const targetQueue = queue || this.config.queue;
        const targetExchange = exchange || this.config.exchange;
        const targetRoutingKey = routingKey || this.config.routingKey;

        try {
            await this.channel.assertExchange(targetExchange, 'direct', { durable: false });
            const q = await this.channel.assertQueue(targetQueue, { exclusive: true });
            
            await this.channel.bindQueue(q.queue, targetExchange, targetRoutingKey);
            
            await this.channel.consume(q.queue, async (msg) => {
                if (msg) {
                    const content = msg.content.toString();
                    await messageHandler(
                        content, 
                        () => this.channel?.ack(msg),
                        () => this.channel?.nack(msg, false, true)
                    );
                }
            }, { noAck: false });
            
            console.log(`Subscribed to queue: ${q.queue} on exchange: ${targetExchange} with routing key: ${targetRoutingKey}`);
        } catch (error) {
            console.error('Failed to subscribe:', error);
            throw error;
        }
    }
}