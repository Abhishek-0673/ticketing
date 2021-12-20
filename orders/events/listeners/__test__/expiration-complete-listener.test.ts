import { Order } from "../../../src/models/order";
import { Ticket } from "../../../src/models/ticket";
import { natsWrapper } from "../../../src/nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from 'mongoose';
import { ExpirationCompleteEvent, OrderStatus } from "@asticketing/common";
import {Message} from 'node-nats-streaming';

const setup = async()=>{
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'jjfv',
    expiresAt: new Date(),
    ticket
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  // @ts-ignore
  const msg: Message  = {
    ack: jest.fn()
  }

  return {listener, order, ticket, data ,msg}
}

it('updates the order status to cancelled',async()=>{
  const {listener, order, ticket, data ,msg} = await setup();
  await listener.onMessage(data,msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  
});

it('emit an order:cancelled event',async()=>{

  const {listener, order, data ,msg} = await setup();
  
  await listener.onMessage(data,msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  
  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);

});

it('ack the message',async()=>{

  const {listener,  data ,msg} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});