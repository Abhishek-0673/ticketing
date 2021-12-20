import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../src/nats-wrapper";
import { Ticket } from "../../../src/models/ticket";
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from "@asticketing/common";
import {Message} from 'node-nats-streaming';

const setup = async()=>{
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 12
  });

  await ticket.save();

  // Create a fake data object
  const data:TicketUpdatedEvent['data'] = {
    id : ticket.id,
    version: ticket.version + 1,
    title: 'new-concert',
    price: 120,
    userId: 'dhchd'
  };

  // Create  a fake message object
  // @ts-ignore
  const msg:Message = {
    ack: jest.fn()
  };

  // return all of this stuff
  return{msg, data, listener, ticket};
};

it('finds, updated and saves a ticket',async()=>{
  const {msg, data, listener, ticket} = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message',async()=>{
  const {msg, data, ticket, listener} = await setup();

  await listener.onMessage(data,msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number',async()=>{

  const {msg, data, listener, ticket} = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);  
  } catch (error) {
    return;
  }
expect(msg.ack).not.toHaveBeenCalled();

});