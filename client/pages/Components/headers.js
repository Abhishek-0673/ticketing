import React from 'react'
import Link from 'next/link'


const headers = ({currentUser}) => {

  const links = [
    !currentUser && {label: 'sign Up', href:"/auth/signup"},
    !currentUser && {label: "sign In", href:"/auth/signin"},
    currentUser && {label:'My Orders', href:'/orders'},
    currentUser && {label: 'Sell Tikcets', href:'tickets/new'},
    currentUser && {label:'Sign out', href:"/auth/signout"}
  ]
  .filter(linkConfig => linkConfig)
  .map(({label, href}) =>{
    return (
      <li key={href} className="nav-item">
        <Link href={href}>
          <a className="nav-link">{label}</a>
        </Link>
      </li>
    )
  })

  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <Link href="/">
          <a className="navbar-brand">GitTix</a>
        </Link>

        <div className="d-flex justify-content-end">
          <ul className="nav d-flex align-items-center">
            {links}
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default headers
