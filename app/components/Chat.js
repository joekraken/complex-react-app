import React, { useEffect, useContext, useRef } from "react"
import { Link } from "react-router-dom"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import io from "socket.io-client"
const socket = io("http://localhost:8080")

function Chat(props) {
  const chatInputField = useRef(null)
  // global app state & dispatch
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
  })

  useEffect(() => {
    if (appState.isChatOpen) {
      chatInputField.current.focus()
    }
  }, [appState.isChatOpen])

  useEffect(() => {
    // listen for broadcast from server
    socket.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })
  }, [])

  // save each user keystroke to state
  function handleFieldChange(e) {
    // store input field value, to ensure it is accessible in setState()
    const value = e.target.value
    setState(draft => {
      draft.fieldValue = value
    })
  }

  // submit chat message
  function handleSubmit(e) {
    e.preventDefault()
    // send a message to chat server
    socket.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token })

    setState(draft => {
      // add new message to state
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar })
      // clear chat field after submit
      draft.fieldValue = ""
    })
  }

  return (
    <div id='chat-wrapper' className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className='chat-title-bar bg-primary'>
        Chat
        <span onClick={() => appDispatch({ type: "closeChat" })} className='chat-title-bar-close'>
          <i className='fas fa-times-circle'></i>
        </span>
      </div>
      <div id='chat' className='chat-log'>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div id={index} className='chat-self'>
                <div className='chat-message'>
                  <div className='chat-message-inner'>{message.message}</div>
                </div>
                <img className='chat-avatar avatar-tiny' src={message.avatar} />
              </div>
            )
          }
          return (
            <div className='chat-other'>
              <Link to={`/profile/${message.username}`}>
                <img className='avatar-tiny' src={message.avatar} />
              </Link>
              <div className='chat-message'>
                <div className='chat-message-inner'>
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSubmit} id='chatForm' className='chat-form border-top'>
        <input value={state.fieldValue} onChange={handleFieldChange} ref={chatInputField} type='text' className='chat-field' id='chatField' placeholder='Type a message…' autoComplete='off' />
      </form>
    </div>
  )
}

export default Chat
