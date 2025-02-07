process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import { Server } from './lib/Server'

const main = async () => {
    const server = new Server();
    await server.start();
}

main()
