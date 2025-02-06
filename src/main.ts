import { PostgresWrapper } from './lib/PostgresWrapper'
import { RedisWrapper } from './lib/RedisWrapper'
import { RabbitMQConsumerWrapper } from './lib/RabbitMQConsumerWrapper'
import { RabbitMQProducerWrapper } from './lib/RabbitMQProducerWrapper'
import { KafkaConsumerWrapper } from './lib/KafkaConsumerWrapper'
import { KafkaProducerWrapper } from './lib/KafkaProducerWrapper'

const main = async () => {
    try {
        console.log('PostgreSQL connecting...')
        const pg = new PostgresWrapper()
        await pg.connect()
        const result = await pg.query('SELECT 1')
        console.log('PostgreSQL connected:', result)
        
        console.log('Redis connecting...')
        const redis = new RedisWrapper()
        await redis.connect()
        console.log('Redis connected')
        const redisResult = await redis.get('test')
        console.log('Redis result:', redisResult)
        
        console.log('Kafka connecting...')
        const kafkaConsumer = new KafkaConsumerWrapper()
        const kafkaProducer = new KafkaProducerWrapper()
        await kafkaConsumer.connect();
        await kafkaProducer.connect();
        console.log('Kafka connected')

        console.log('Kafka consumer subscribing...')
        await kafkaConsumer.subscribe({ fromBeginning: false });
        await kafkaConsumer.startConsuming(async (messageData: any) => {
            console.log('Received Kafka message:', messageData);
        });
        console.log('Kafka consumer subscribed')

        setInterval(async () => {
            console.log('Kafka producer sending message...')
            await kafkaProducer.sendMessage('Hello World!', 'test-topic');
            console.log('Kafka producer message sent')
        }, 1000)

        console.log('RabbitMQ connecting...')
        const rabbitmqConsumer = new RabbitMQConsumerWrapper()
        const rabbitmqProducer = new RabbitMQProducerWrapper()
        await rabbitmqConsumer.connect()        
        await rabbitmqProducer.connect()
        console.log('RabbitMQ connected')

        console.log('RabbitMQ consumer consuming...')
        const messageHandler = async (content: string, ack: () => void, nack: () => void) => {
            try {
                console.log('RabbitMQ consumer received:', content)
                ack();
            } catch (error) {
                nack();
            }
        };
        await rabbitmqConsumer.subscribe(messageHandler, 'my_queue2', 'my_exchange2', 'my_routing_key2')
        console.log('RabbitMQ consumer consumed')

        setInterval(async () => {
            console.log('RabbitMQ producer publishing...')
            await rabbitmqProducer.sendMessage('my_exchange2', 'my_routing_key2', 'Hello World!')
            console.log('RabbitMQ producer published')
        }, 1000)
        
        console.log('Services connected')
    } catch (error) {
        console.error('Connection error:', error)
        process.exit(1)
    }
}

main()
