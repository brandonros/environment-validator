import pDefer from 'p-defer'
import { PostgresWrapper } from '../lib/PostgresWrapper'
import { RedisWrapper } from '../lib/RedisWrapper'
import { RabbitMQConsumerWrapper } from '../lib/RabbitMQConsumerWrapper'
import { RabbitMQProducerWrapper } from '../lib/RabbitMQProducerWrapper'
import { KafkaConsumerWrapper } from '../lib/KafkaConsumerWrapper'
import { KafkaProducerWrapper } from '../lib/KafkaProducerWrapper'
import { createTimeout } from '../lib/utilities'

export class HealthService {
    async checkServices(): Promise<void> {
        await Promise.all([
            this.checkPostgres(),
            this.checkRedis(),
            this.checkKafka(),
            this.checkRabbitMQ()
        ])
        console.log('Services connected')
    }

    private async checkPostgres(): Promise<void> {
        console.log('PostgreSQL connecting...')
        const pg = new PostgresWrapper()
        await pg.connect()
        const result = await pg.query('SELECT 1')
        console.log('PostgreSQL connected:', result)
    }

    private async checkRedis(): Promise<void> {
        console.log('Redis connecting...')
        const redis = new RedisWrapper()
        await redis.connect()
        console.log('Redis connected')
        const redisResult = await redis.get('test')
        console.log('Redis result:', redisResult)
    }

    private async checkKafka(): Promise<void> {
        console.log('Kafka connecting...')
        const kafkaConsumer = new KafkaConsumerWrapper()
        const kafkaProducer = new KafkaProducerWrapper()
        await kafkaConsumer.connect();
        await kafkaProducer.connect();
        console.log('Kafka connected')

        const messageReceived = pDefer<any>();
        const timeout = createTimeout(5000, 'Kafka message flow timeout');

        console.log('Kafka consumer subscribing...')
        await kafkaConsumer.subscribe({ fromBeginning: false });
        await kafkaConsumer.startConsuming(async (messageData: any) => {
            console.log('Received Kafka message:', messageData);
            messageReceived.resolve(messageData);
        });
        console.log('Kafka consumer subscribed')

        console.log('Kafka producer sending message...')
        await kafkaProducer.sendMessage('Hello World!', 'test-topic1');
        console.log('Kafka producer message sent')

        // Wait for the consumer to receive the message
        const receivedMessage = await Promise.race([messageReceived.promise, timeout]);
        console.log('Message flow verified:', receivedMessage);
    }

    private async checkRabbitMQ(): Promise<void> {
        console.log('RabbitMQ connecting...')
        const rabbitmqConsumer = new RabbitMQConsumerWrapper()
        const rabbitmqProducer = new RabbitMQProducerWrapper()
        const messageReceived = pDefer<string>();
        const timeout = createTimeout(5000, 'RabbitMQ message flow timeout');

        await rabbitmqConsumer.connect()        
        await rabbitmqProducer.connect()
        console.log('RabbitMQ connected')

        console.log('RabbitMQ consumer consuming...')
        const messageHandler = async (content: string, ack: () => void, nack: () => void) => {
            try {
                console.log('RabbitMQ consumer received:', content)
                messageReceived.resolve(content);
                ack();
            } catch (error) {
                nack();
            }
        };
        await rabbitmqConsumer.subscribe(messageHandler, 'my_queue3', 'my_exchange3', 'my_routing_key3')
        console.log('RabbitMQ consumer consumed')

        console.log('RabbitMQ producer publishing...')
        await rabbitmqProducer.sendMessage('my_exchange3', 'my_routing_key3', 'Hello World!')
        console.log('RabbitMQ producer published')

        // Wait for the consumer to receive the message
        const receivedMessage = await Promise.race([messageReceived.promise, timeout]);
        console.log('Message flow verified:', receivedMessage);
    }
}