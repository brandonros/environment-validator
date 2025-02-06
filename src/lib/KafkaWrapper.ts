import { Kafka } from 'kafkajs';
export class KafkaWrapper {
    config: any;
    kafka: Kafka;

    constructor(config: any = {}) {
        this.config = {
            clientId: config.clientId || `kafka-client-${crypto.randomUUID()}`,
            brokers: config.brokers || ['debian-k3s:9095'],
            topic: config.topic || 'test-topic',
            sasl: config.sasl || {
                mechanism: 'plain',
                username: 'user1',
                password: 'KPQDXG5OkQ'
            },
            ssl: config.ssl || false
        };

        this.kafka = new Kafka({
            clientId: this.config.clientId,
            brokers: this.config.brokers,
            ssl: this.config.ssl,
            sasl: this.config.sasl
        });
    }
}
