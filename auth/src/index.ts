import {app} from './app';

import mongoose from 'mongoose';

const PORT = 3000;
const connectDB = async()=>{

  if(!process.env.JWT_KEY){
    throw new Error("JWT_KEY must be defined");
  }

if(!process.env.MONGO_URI){
  throw new Error("MONGO_URI must be defined")
}
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to mongoDB database successfully!')
  } catch (err) {
    console.error(err);
  }
  
  app.listen(PORT,()=> console.log(`Auth service listening on port ${PORT}!`));

};

connectDB();

