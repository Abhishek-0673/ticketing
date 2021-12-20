import { Subjects,Publisher, PaymentCreatedEvent } from "@asticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated;
}