import request from 'supertest';
import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {app} from '../app';
import jwt from 'jsonwebtoken';

declare global {
  var signin:(id?:string) => string[];
}

jest.mock('../nats-wrapper');

// Please store this in your environment variable
process.env.STRIPE_KEY = "sk_test_51K5V5VSFNdNkTg14Ivsohwdu4BBil9nVSqV83mdlw6DANgr7BT6RMwKz7oqwSzijCRZCbScWIR0FrsSTrzHeLjq100YIBrUNX8";

let mongo:any;
beforeAll(async()=>{
  process.env.JWT_KEY = "secret";

  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = mongo.getUri();
  
  await mongoose.connect(mongoUri);
});


beforeEach(async()=>{
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for(let collection of collections){
    await collection.deleteMany({});
  }
});

afterAll(async()=>{
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?:string) => {
  // Build a JWT payload, {id, email} <- We're tying to mock sign up here
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email:'test@test.com'
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build sessio Object. { jwt: MY_JWT}
  const session = {jwt: token};

  // Turn that session into json                
  const sessionJSON = JSON.stringify(session);

  // Take that json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string, that's the cookie with endoded data

  return [`express:sess=${base64}`];
}