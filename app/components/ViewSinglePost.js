import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { Link, useParams, useNavigate } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import ReactMarkdown from "react-markdown"
import { Tooltip as ReactTooltip } from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost(props) {
  const navigate = useNavigate()
  // global state and dispatch
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()

  useEffect(() => {
    // (deprecated) cancel token to access Axios request
    // const ourRequest = Axios.CancelToken.source()
    const requestController = new AbortController()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { signal: requestController.signal })
        setPost(response.data)
        setIsLoading(false)
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

  if (!isLoading && !post) {
    return <NotFound />
  }

  // check if waiting for server response
  if (isLoading)
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    )

  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getMonth() + 1}/${date.getDay()}/${date.getFullYear()}`

  // verify user owns this post
  function isOwner() {
    if (appState.loggedIn) {
      // return current user is post's author
      return appState.user.username == post.author.username
    }
    return false
  }

  // delete post
  async function deleteHandler() {
    const confirmDeletePost = window.confirm("Confirm, do you want to delete this post?")
    if (confirmDeletePost) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: appState.user.token } })
        // check delete is successful
        if (response.data == "Success") {
          appDispatch({ type: "flashMessage", value: "Post was successfully deleted." })
          navigate(`/profile/${appState.user.username}`) // redirect to user profile
        }
      } catch (e) {
        console.log("Error occured")
        console.log(e)
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className='d-flex justify-content-between'>
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className='pt-2'>
            <Link to={`/post/${post._id}/edit`} data-tooltip-content='Edit' data-tooltip-id='edit' className='text-primary mr-2'>
              <i className='fas fa-edit'></i>
            </Link>
            <ReactTooltip id='edit' className='custom-tooltip' />{" "}
            <a onClick={deleteHandler} data-tooltip-content='Delete' data-tooltip-id='delete' className='delete-post-button text-danger'>
              <i className='fas fa-trash'></i>
            </a>
            <ReactTooltip id='delete' className='custom-tooltip' />
          </span>
        )}
      </div>

      <p className='text-muted small mb-4'>
        <Link to={`/profile/${post.author.username}/`}>
          <img className='avatar-tiny' src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}/`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className='body-content'>
        <ReactMarkdown children={post.body} allowedElements={["p", "br", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li"]} />
      </div>
    </Page>
  )
}

export default ViewSinglePost
