import { KafkaWrapper } from "./KafkaWrapper";
import { Consumer } from "kafkajs";
export class KafkaConsumerWrapper extends KafkaWrapper {
    consumer: Consumer;
    groupId: string;
    isConnected: boolean;

    constructor(config: any = {}) {
        super(config);
        this.groupId = config.groupId || `consumer-group-${crypto.randomUUID()}`;
        this.consumer = this.kafka.consumer({ groupId: this.groupId });
        this.isConnected = false;
    }

    async connect() {
        try {
            await this.consumer.connect();
            this.isConnected = true;
            console.log('Consumer connected');
            return this;
        } catch (error) {
            console.error('Failed to connect consumer:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            try {
                await this.consumer.disconnect();
                this.isConnected = false;
                console.log('Consumer disconnected');
            } catch (error) {
                console.error('Failed to disconnect consumer:', error);
                throw error;
            }
        }
    }

    async subscribe(options: any = {}) {
        if (!this.isConnected) {
            throw new Error('Consumer is not connected');
        }

        try {
            await this.consumer.subscribe({
                topic: this.config.topic,
                fromBeginning: options.fromBeginning || false
            });
            console.log(`Subscribed to topic: ${this.config.topic}`);
        } catch (error) {
            console.error('Failed to subscribe:', error);
            throw error;
        }
    }

    async startConsuming(messageHandler: any) {
        if (!this.isConnected) {
            throw new Error('Consumer is not connected');
        }

        try {
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const messageData = {
                        topic,
                        partition,
                        offset: message.offset,
                        key: message.key?.toString(),
                        value: message.value?.toString()
                    };

                    if (typeof messageHandler === 'function') {
                        await messageHandler(messageData);
                    } else {
                        console.log('Received message:', messageData);
                    }
                }
            });
            console.log('Started consuming messages');
        } catch (error) {
            console.error('Failed to start consuming:', error);
            throw error;
        }
    }
}
