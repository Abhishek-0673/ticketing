import React, {useState} from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const signup = ()=> {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {doRequest, errors} = useRequest({
    url:"/api/users/signin",
    method: 'post',
    body: {
      email, password
    },
    onSuccess: ()=>{
      Router.push('/');
    }
  })

  const onSubmit = async(e)=>{
   e.preventDefault();

   await doRequest();
   
  }

  return (
    <div>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="text" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="form-control"
          />

        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password"
            value={password}
            onChange={e => setPassword(e.target.value)} 
            className="form-control"
          />
        </div>
       {errors}
        <button className="btn btn-primary">Sign in</button>
      </form>
    </div>
  )
}

export default signup
