import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
const PORT = 3000;
const connectDB = async()=>{

  if(!process.env.NATS_CLIENT_ID){
    throw new Error("NATS_CLIENT_ID must be defined")
  }
  if(!process.env.NATS_URL){
    throw new Error("NATS_URL must be defined")
  }
  if(!process.env.NATS_CLUSTER_ID){
    throw new Error("NATS_CLUSTER_ID must be defined")
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL);
    
    natsWrapper.client.on('close',()=>{
      console.log('NATS connection closed!');
      process.exit();
    });

    // Graceful close-down when any client is shutdown
    process.on('SIGINT',()=> natsWrapper.client.close()); // Interrupt signal
    process.on('SIGTERM',()=> natsWrapper.client.close()); // Terminate signal

    // Start Listening to the order service
    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }

};

connectDB();

