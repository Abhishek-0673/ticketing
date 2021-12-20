import mongoose from 'mongoose';
import {Order, OrderStatus} from './order';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

interface TicketAttrs{
  id:string;
  title:string;
  price: number;
}

export interface TicketDoc extends mongoose.Document{
  title:string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
  build(attrs:TicketAttrs):TicketDoc;
  findByEvent(event: {id: string, version: number}):Promise<TicketDoc | null>;
}

const ticketSchmea = new mongoose.Schema({
  title: {
    type:String,
    required: true
  },
  price:{
    type:Number,
    required: true,
    min:0
  }
},{
  toJSON:{
    transform(doc,ret){
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

ticketSchmea.set('versionKey','version');
ticketSchmea.plugin(updateIfCurrentPlugin);

/*
To achieve the same functionality offered by mongoose-update-if-current use the following middleware

// Customize the find-and-update oparation (save) to look for the correct version

ticketSchmea.pre('save',function(done){
  // @ts-ignore
  this.$where = {
    version: this.get('version') - 1
  };

  done();
});

*/

// This method is available at the model level 
ticketSchmea.statics.findByEvent = (event:{id: string, version:number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version -1
  });
}

ticketSchmea.statics.build = (attrs:TicketAttrs) =>{
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
}

// This method is vialable is at Doc level &&

// Make sure that this ticket is not already reserved
  // Run query to look at all orders. Find an order where the ticket 
  // is the ticket we just found *and* the orders status is  *notz* cancelled
  // If we fin the order  from that means the ticket *is* reserved
ticketSchmea.methods.isReserved = async function(){ 
// this === ticket tDocument that we just called 'isReserved' on
const existingOrder = await Order.findOne({
  ticket:this as any,
  status: {
    $in: [
      OrderStatus.Created,
      OrderStatus.AwaitingPayment,
      OrderStatus.Complete
    ]
}});

return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc,TicketModel>('Ticket',ticketSchmea);

export {
  Ticket
}