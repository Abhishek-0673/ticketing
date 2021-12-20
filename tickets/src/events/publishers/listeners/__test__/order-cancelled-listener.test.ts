import { Ticket } from "../../../../models/ticket";
import { natsWrapper } from "../../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from 'mongoose';
import { OrderCancelledEvent } from "@asticketing/common";
import {Message} from 'node-nats-streaming';
const setup = async ()=>{

  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = await Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'acdu'
  });

  ticket.set({orderId});

  await ticket.save();

  const data:OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }

  // @ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }

  return {msg, data, ticket, orderId,listener};
}

it('updated the ticket, publishes ab event, and acks the message',async()=>{
  const {msg, data, ticket, listener, orderId} = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});