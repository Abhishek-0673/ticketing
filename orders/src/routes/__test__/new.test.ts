import request from 'supertest';
import mongoose from 'mongoose';
import {app} from '../../app';
import {Order} from '../../models/order';
import {Ticket} from '../../models/ticket';
import {OrderStatus} from '@asticketing/common';
import {natsWrapper} from '../../nats-wrapper';


it('returns an error if the user tries to create a ticket that does not exist',async()=>{
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
  .post('/api/orders')
  .set('Cookie',global.signin())
  .send({
    ticketId
  })
  .expect(404);

});

it('returns an error if the ticket is already reserved',async()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 200
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId:'hduhcudchu',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });

  await order.save();

  await request(app)
  .post('/api/orders')
  .set('Cookie',global.signin())
  .send({ticketId: ticket.id})
  .expect(400)
});

it('reserves a ticket',async()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title:'concert',
    price: 200
  });

  await ticket.save();

  await request(app)
  .post('/api/orders')
  .set('Cookie',global.signin())
  .send({ticketId: ticket.id})
  .expect(201);
});

it('emits an order created event',async()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 200
  });

  await ticket.save();

  await request(app)
  .post('/api/orders')
  .set('Cookie',global.signin())
  .send({ticketId: ticket.id})
  .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});