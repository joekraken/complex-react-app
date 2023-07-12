import React from "react"
import Page from "./Page"
import { Link } from "react-router-dom"

function NotFound(props) {
  return (
    <Page title='Not Found'>
      <div className='text-center'>
        <h2>Whoops, that page not found.</h2>
        <p className='lead text-muted'>
          Please visit <Link to='/'>homepage</Link> too start over.
        </p>
      </div>
    </Page>
  )
}

export default NotFound
