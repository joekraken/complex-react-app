import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { Link, useParams } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { useImmerReducer } from "use-immer"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost(props) {
  // global state and dispatch
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const initState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isLoading: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0
  }
  // listen and perform actions on page
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.data.title
        draft.body.value = action.data.body
        draft.isLoading = false
        return
      case "titleUpdate":
        draft.title.value = action.value
        return
      case "bodyUpdate":
        draft.body.value = action.value
        return
      case "submitRequest":
        draft.sendCount++
        return
      case "saveRequestStarted":
        draft.isSaving = true
        return
      case "saveRequestFinished":
        draft.isSaving = false
        return
      default:
        break
    }
  }

  // state is data, dispatch is like a listener, reducer performs actions based on dispatch request
  const [state, dispatch] = useImmerReducer(ourReducer, initState)

  // on init fetch and load post to edit
  useEffect(() => {
    // (deprecated) cancel token to access Axios request
    // const ourRequest = Axios.CancelToken.source()
    const requestController = new AbortController()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { signal: requestController.signal })
        dispatch({ type: "fetchComplete", data: response.data })
      } catch (e) {
        console.log("ERROR: there is a problem or request canceled")
        console.log(e)
      }
    }
    fetchPost()
    // return a clean up function, when component is unmounted (not rendered)
    return () => {
      requestController.abort()
    }
    // empty [] brackets run useEffect on init
  }, [])

  // on sendCount change, send Axios post() request
  useEffect(() => {
    // check sendCount is > 0
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" })
      const requestController = new AbortController()

      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { signal: requestController.signal })
          dispatch({ type: "saveRequestFinished" })
          appDispatch({ type: "flashMessage", value: "Post was updated" })
        } catch (e) {
          console.log("ERROR: there is a problem or request canceled")
          console.log(e)
        }
      }
      fetchPost()
      // return a clean up function, when component is unmounted (not rendered)
      return () => {
        requestController.abort()
      }
    }
    // brackets [],  run when sendCount changes
  }, [state.sendCount])

  // check if waiting for server response
  if (state.isLoading)
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    )

  async function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: "submitRequest" })
  }

  return (
    <Page title='Edit Post'>
      <form onSubmit={submitHandler}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input onChange={e => dispatch({ type: "titleUpdate", value: e.target.value })} value={state.title.value} autoFocus name='title' id='post-title' className='form-control form-control-lg form-control-title' type='text' placeholder='' autoComplete='off' />
        </div>
        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea onChange={e => dispatch({ type: "bodyUpdate", value: e.target.value })} value={state.body.value} name='body' id='post-body' className='body-content tall-textarea form-control' type='text' />
        </div>
        <button className='btn btn-primary' disabled={state.isSaving}>
          {state.isSaving ? "Saving..." : "Save Updates"}
        </button>
      </form>
    </Page>
  )
}

export default ViewSinglePost
