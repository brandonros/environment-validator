import { Server } from './lib/Server'

const main = async () => {
    const server = new Server();
    await server.start();
}

main()
