import { createLibp2p } from "libp2p";
import {tcp } from "@libp2p/tcp";
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { multiaddr } from "multiaddr";
import { ping } from "@libp2p/ping";

const main = async () => {
    const node = await createLibp2p({
        addresses: {
            // add a listen address (localhost) to accept TCP connections on a random port
            listen: ['/ip4/127.0.0.1/tcp/0']
          },
        transports:[tcp()],
        connectionEncryption: [noise()],
        streamMuxers: [mplex()],
        services: {
            ping: ping({
                protocolPrefix:'ipfs' // default
            }),
        },
    
    });
    // start libp2p
    await node.start();
    console.log("libp2p has started");
    // print out listening addresses
    console.log("listening on addresses:");
    node.getMultiaddrs().forEach(addr =>{
        console.log(addr.toString());
    });
    // ping peer if received multiaddr 
    if(process.argv.length >= 3){
        const ma = multiaddr(process.argv[2]);
        console.log(`ping remote peer at ${process.argv[2]}`);
        const latency = await node.services.ping.ping(ma);
        console.log(`pinged ${process.argv[2]} in ${latency}`);
    } else{
        console.log("no remote peer address received, skipping pinging");
    }
    const stop = async() => {
        await node.stop();
     console.log("libp2p has stopped");
     process.exit(0);
    }
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
}
main()
.then()
.catch(console.error());
