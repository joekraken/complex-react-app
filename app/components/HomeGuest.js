import React, { useEffect, useContext, useState } from "react"
import Page from "./Page"
import Axios from "axios"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import DispatchContext from "../DispatchContext"

function HomeGuest() {
  const appDispatch = useContext(DispatchContext)

  const initState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      // to execute after every key stroke
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.message = "Username cannot exceed 30 characters"
        }
        // validate with regExp that username only has alphanumeric characters
        if (draft.username.value && !/^([a-zA-z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Username can only contain letters and numbers"
        }
        return
      // execute validation after delay to key stroke
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.message = "Username must have at least 3 characters long"
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        return
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "That username is already taken"
        } else {
          draft.username.isUnique = true
        }
        return
      case "emailImmediately":
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case "emailAfterDelay":
        // check email matches basic pattern
        if (!/^\S+@\S+.\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "You must provide a valid email address"
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        return
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.message = "That email is already taken"
        } else {
          draft.email.isUnique = true
        }
        return
      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be less than 50 characters long"
        }
        return
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be at least 12 characters long"
        }
        return
      case "submitForm":
        // if no issues & no errors, increase submitCount to trigger useEffect()
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++
        }
        return
      default:
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initState)

  // listen for changes to username input value
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800)
      // return clean up function
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  // listen to checkCount and verify username is unique
  useEffect(() => {
    if (state.username.checkCount) {
      const requestController = new AbortController()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { signal: requestController.signal })
          dispatch({ type: "usernameUniqueResults", value: response.data })
        } catch (e) {
          console.log("Error occured verifying username.")
          console.log(e)
        }
      }
      fetchResults()
      // clean up
      return () => requestController.abort()
    }
  }, [state.username.checkCount])

  // listen for changes to email input value
  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800)
      // return clean up function
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  // listen to checkCount and verify email is unique
  useEffect(() => {
    if (state.email.checkCount) {
      const requestController = new AbortController()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { signal: requestController.signal })
          dispatch({ type: "emailUniqueResults", value: response.data })
        } catch (e) {
          console.log("Error occured verifying email.")
          console.log(e)
        }
      }
      fetchResults()
      // clean up
      return () => requestController.abort()
    }
  }, [state.email.checkCount])

  // listen for changes to password input value
  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800)
      // return clean up function
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  // listen to submit count and send new user registration
  useEffect(() => {
    if (state.submitCount) {
      const requestController = new AbortController()
      async function submitNewUser() {
        try {
          const response = await Axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { signal: requestController.signal })
          appDispatch({ type: "login", data: response.data })
          appDispatch({ type: "flashMessage", value: "Congrats! You successfully registered your new account." })
        } catch (e) {
          console.log("Error: unable to register new user")
          console.log(e)
        }
      }
      submitNewUser()
      // clean up
      return () => requestController.abort()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    // call dispatch for all validation rules
    dispatch({ type: "usernameImmediately", value: state.username.value })
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true })
    dispatch({ type: "emailImmediately", value: state.email.value })
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true })
    dispatch({ type: "passwordImmediately", value: state.password.value })
    dispatch({ type: "passwordAfterDelay", value: state.password.value })

    dispatch({ type: "submitForm" })
  }

  return (
    <Page title='Welcome!' wide={true}>
      <div className='row align-items-center'>
        <div className='col-lg-7 py-3 py-md-5'>
          <h1 className='display-3'>Remember Writing?</h1>
          <p className='lead text-muted'>Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className='col-lg-5 pl-lg-5 pb-3 py-lg-5'>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor='username-register' className='text-muted mb-1'>
                <small>Username</small>
              </label>
              <input onChange={e => dispatch({ type: "usernameImmediately", value: e.currentTarget.value })} id='username-register' name='username' className='form-control' type='text' placeholder='Pick a username' autoComplete='off' />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames='liveValidateMessage' unmountOnExit>
                <div className='alert alert-danger small liveValidateMessage'>{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className='form-group'>
              <label htmlFor='email-register' className='text-muted mb-1'>
                <small>Email</small>
              </label>
              <input onChange={e => dispatch({ type: "emailImmediately", value: e.currentTarget.value })} id='email-register' name='email' className='form-control' type='text' placeholder='you@example.com' autoComplete='off' />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames='liveValidateMessage' unmountOnExit>
                <div className='alert alert-danger small liveValidateMessage'>{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className='form-group'>
              <label htmlFor='password-register' className='text-muted mb-1'>
                <small>Password</small>
              </label>
              <input onChange={e => dispatch({ type: "passwordImmediately", value: e.currentTarget.value })} id='password-register' name='password' className='form-control' type='password' placeholder='Create a password' />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames='liveValidateMessage' unmountOnExit>
                <div className='alert alert-danger small liveValidateMessage'>{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type='submit' className='py-3 mt-4 btn btn-lg btn-success btn-block'>
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomeGuest
