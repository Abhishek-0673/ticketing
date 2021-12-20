import { Publisher,Subjects,TicketUpdatedEvent } from '@asticketing/common';


export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
 
}