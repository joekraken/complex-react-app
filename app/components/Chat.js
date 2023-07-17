import React, { useEffect, useContext, useRef } from "react"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"

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
    // send message to chat server
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
              <a href='#'>
                <img className='avatar-tiny' src={message.avatar} />
              </a>
              <div className='chat-message'>
                <div className='chat-message-inner'>
                  <a href='#'>
                    <strong>{message.username}:</strong>
                  </a>
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
