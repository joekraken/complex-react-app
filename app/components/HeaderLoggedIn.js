import React, { useContext, useEffect } from "react"
import { Link } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import { Tooltip as ReactTooltip } from "react-tooltip"

function HeaderLoggedIn(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  function handleLogout() {
    appDispatch({ type: "logout" })
  }

  // request global dispatch to open the search component
  function handleSearchIcon(e) {
    e.preventDefault()
    appDispatch({ type: "openSearch" })
  }

  return (
    <div className='flex-row my-3 my-md-0'>
      <a onClick={handleSearchIcon} href='#' data-tooltip-content='Search' data-tooltip-id='search' className='mr-2 header-chat-icon text-white'>
        <i className='fas fa-search'></i>
      </a>
      <ReactTooltip place='bottom' id='search' className='custom-tooltip' />{" "}
      <span onClick={() => appDispatch({ type: "toggleChat" })} data-tooltip-content='Chat' data-tooltip-id='chat' className={"mr-2 header-search-icon " + (appState.unreadChatCount ? "text-danger" : "text-white")}>
        <i className='fas fa-comment'></i>
        {appState.unreadChatCount ? <span className='chat-count-badge text-white'>{appState.unreadChatCount < 10 ? appState.unreadChatCount : "9+"}</span> : ""}
      </span>
      <ReactTooltip place='bottom' id='chat' className='custom-tooltip' />{" "}
      <Link data-tooltip-content='My Profile' data-tooltip-id='profile' to={`/profile/${appState.user.username}`} className='mr-2'>
        <img className='small-header-avatar' src={appState.user.avatar} />
      </Link>
      <ReactTooltip place='bottom' id='profile' className='custom-tooltip' />{" "}
      <Link className='btn btn-sm btn-success mr-2' to='/create-post'>
        Create Post
      </Link>{" "}
      <button onClick={handleLogout} className='btn btn-sm btn-secondary'>
        Sign Out
      </button>
    </div>
  )
}

export default HeaderLoggedIn
