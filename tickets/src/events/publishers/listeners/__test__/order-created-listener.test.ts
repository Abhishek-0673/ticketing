import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../../nats-wrapper";
import { Ticket } from "../../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@asticketing/common";
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';

const setup = async()=>{
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save the ticket
  const ticket =  Ticket.build({
    title:'concert',
    price:22,
    userId: 'gcydvg'
  });

  await ticket.save();

  // Create the fake data object
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'hdhdh',
    expiresAt: 'chvuf',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }

  // @ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }

  return {listener, ticket, data, msg};
}

it('sets the userId of the ticket',async()=>{
  const {ticket,listener, data, msg} = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message',async()=>{
  const {ticket,listener, data, msg} = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event',async()=>{
  const {listener, ticket, data, msg}  = await setup();

  await listener.onMessage(data,msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const values = (natsWrapper.client.publish as jest.Mock).mock.calls;
  const ticketUpdatedData = JSON.parse(values[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);

});