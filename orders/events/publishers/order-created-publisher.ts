import { Publisher,OrderCreatedEvent,Subjects } from "@asticketing/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated;

}

