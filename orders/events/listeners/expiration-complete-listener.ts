import { ExpirationCompleteEvent, Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@asticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../src/models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete;

  readonly queueGroupName = queueGroupName;

  async onMessage(data:ExpirationCompleteEvent['data'],msg:Message){
    const order = await Order.findById(data.orderId).populate('ticket');

    if(!order){
      throw new Error('Order not found');
    }

    if(order.status === OrderStatus.Complete){
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled
    });

    await order.save();

    // Publish the order:cancelled event. so that the rest of the services will know abot this
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price
      }
    });

    msg.ack();
  }
}


