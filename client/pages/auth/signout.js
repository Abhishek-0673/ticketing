import { useEffect } from "react";
import Router from 'next/router'
import useRequest from "../../hooks/use-request";

import React from 'react'

const signout = () => {

  const {doRequest} = useRequest({
    url:'/api/users/signout',
    method: 'post',
    body:{},
    onSuccess: ()=> Router.push('/')
  });

  useEffect(()=>{
    doRequest();
  },[]);

  return (
    <div>
      <h1>Signing you out...</h1>
    </div>
  )
}

export default signout
