import { Producer } from "kafkajs";
import { KafkaWrapper } from "./KafkaWrapper";

export class KafkaProducerWrapper extends KafkaWrapper {
    producer: Producer;
    isConnected: boolean;
    
    constructor(config = {}) {
        super(config);
        this.producer = this.kafka.producer();
        this.isConnected = false;
    }

    async connect() {
        try {
            await this.producer.connect();
            this.isConnected = true;
            console.log('Producer connected');
            return this;
        } catch (error) {
            console.error('Failed to connect producer:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            try {
                await this.producer.disconnect();
                this.isConnected = false;
                console.log('Producer disconnected');
            } catch (error) {
                console.error('Failed to disconnect producer:', error);
                throw error;
            }
        }
    }

    async sendMessage(message: any, key: string | null = null) {
        if (!this.isConnected) {
            throw new Error('Producer is not connected');
        }

        try {
            const kafkaMessage = {
                value: typeof message === 'string' ? message : JSON.stringify(message),
                key: key || `key-${crypto.randomUUID()}`
            };

            await this.producer.send({
                topic: this.config.topic,
                messages: [kafkaMessage]
            });

            console.log(`Sent message: ${kafkaMessage.value}`);
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }
}
