import React, { useEffect, useState } from "react"
import Page from "./Page"
import { Link, useParams } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import { useImmerReducer } from "use-immer"

function ViewSinglePost(props) {
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
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.data.title
        draft.body.value = action.data.body
        draft.isLoading = false
        return

      default:
        break
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initState)

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
  }, [])
  // check if waiting for server response
  if (state.isLoading)
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    )

  async function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <Page title='Edit Post'>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input value={state.title.value} autoFocus name='title' id='post-title' className='form-control form-control-lg form-control-title' type='text' placeholder='' autoComplete='off' />
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea value={state.body.value} name='body' id='post-body' className='body-content tall-textarea form-control' type='text' />
        </div>

        <button className='btn btn-primary'>Save Updates</button>
      </form>
    </Page>
  )
}

export default ViewSinglePost
