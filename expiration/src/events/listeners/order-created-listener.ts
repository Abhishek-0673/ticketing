import { Listener, OrderCreatedEvent, Subjects } from "@asticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{

  readonly subject = Subjects.OrderCreated;
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg:Message){
    
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`To the orderId: ${data.id} waiting for ${delay} milliseconds to process the job`)

    await expirationQueue.add({
      orderId: data.id
    },{
      delay:delay
    });

    msg.ack();
  }
}