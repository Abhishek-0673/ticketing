import {app} from './app';

import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const PORT = 3000;
const connectDB = async()=>{

  console.log('Starting...');
  if(!process.env.JWT_KEY){
    throw new Error("JWT_KEY must be defined");
  }

  if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI must be defined")
  }

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

    // Start listeningto other services
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);  
    console.log('Connected to mongoDB database successfully!')
  } catch (err) {
    console.error(err);
  } 
  
  app.listen(PORT,()=> console.log(`Payments service listening on port ${PORT}!`));

};

connectDB();

