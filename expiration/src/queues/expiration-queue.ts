import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';
interface Payload{
  orderId: string;
}

// Queue name could be anything (ex: 'jjuurufr')
const expirationQueue = new Queue<Payload>('order:expiration',{
  redis:{
    host: process.env.REDIS_HOST
  }
});


expirationQueue.process(async(job)=>{
  /*
   Since It's already a 15 minutes by the time for which order:created published, 
  (received, queued & pushed to the redis server) by the expiration service. 
  It's time to publish the expiration:complete event.
   */
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  })
});

export{
  expirationQueue
};