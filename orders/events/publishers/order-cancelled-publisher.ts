import {Subjects, Publisher, OrderCancelledEvent} from "@asticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled;
}

