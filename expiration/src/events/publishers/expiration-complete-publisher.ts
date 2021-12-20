import { Publisher, ExpirationCompleteEvent, Subjects } from "@asticketing/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete; 
}