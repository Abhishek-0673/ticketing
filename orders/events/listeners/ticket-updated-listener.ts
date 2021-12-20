import {Listener, TicketUpdatedEvent, Subjects} from '@asticketing/common'
import {Message} from 'node-nats-streaming';
import { Ticket } from '../../src/models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg:Message){
    const ticket = await Ticket.findByEvent(data);

    if(!ticket){
      throw new Error('Ticket not found')
    }

    const {title, price} = data;
    ticket.set({
      title,
      price
    });

    /*
    To achieve the same functionality offered by mongoose-update-if-current use the following middleware
    
    // Update the version number on records before they are saved
    
    const {title, price, version} = data;
    ticket.set({
      title,
      price,
      version
    });

    */

    await ticket.save();

    msg.ack();
  }
}