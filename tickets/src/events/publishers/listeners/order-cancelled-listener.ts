import { Listener, OrderCancelledEvent, Subjects } from "@asticketing/common";
import {queueGroupName} from './queue-group-name';
import {Message} from 'node-nats-streaming';
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedPublisher } from "../ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
  readonly queueGroupName = queueGroupName;
  readonly subject = Subjects.OrderCancelled;

  async onMessage(data: OrderCancelledEvent['data'], msg:Message){
    
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    
    // if no ticket, throw error
    if(!ticket){
      throw new Error('Ticket not found')
    }

    // Mark the ticket as being not reserved by removing its orderId property
    ticket.set({
      orderId: undefined
    });

    // save the ticket
    await ticket.save();

    // Publish the event to update the ticket in all other services
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version
    })

    // ack the message
    msg.ack();
  }
}