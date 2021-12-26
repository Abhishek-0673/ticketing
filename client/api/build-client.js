import axios from "axios";

export default ({req})=>{
  if(typeof window === 'undefined'){
    // We are on the server

    return axios.create({
      baseURL:'http://www.abhisheks.live/',
      headers: req.headers
    });

  }else{
    // We are on the client
    return axios.create({
      baseURL:"/"
    })
  }
};