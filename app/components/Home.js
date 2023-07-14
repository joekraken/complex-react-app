import React, { useContext, useEffect } from "react"
import Page from "./Page"
import StateContext from "../StateContext"
import { useImmer } from "use-immer"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Axios from "axios"
import Post from "./Post"

function Home() {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    fead: []
  })

  // retrieve user profile data, posts, and following
  useEffect(() => {
    // use an abort controller to cancel an Axios request, if React component is unmounted
    const requestController = new AbortController()
    // useEffect doesn't accept async functions
    // so, create & execute within passed function
    async function fetchData() {
      try {
        const response = await Axios.post("/getHomeFeed", { token: appState.user.token, signal: requestController.signal })
        setState(draft => {
          draft.isLoading = false
          draft.feed = response.data
        })
      } catch (e) {
        console.log("ERROR: an issue happened")
        console.log(e)
      }
    }
    fetchData()
    // return a clean up function, when component is unmounted (not rendered)
    return () => {
      requestController.abort()
    }
  }, [])
  console.log(state.isLoading)

  // check if feed is loading or retrieved from db
  if (state.isLoading) return <LoadingDotsIcon />
  console.log(state.isLoading)
  return (
    <Page title='your feed'>
      {state.feed.length > 0 && (
        <>
          <h2 className='text-center mb-4'>The latest from those you are following:</h2>
          <div className='list-group'>
            {state.feed.map(post => {
              return <Post post={post} key={post._id} />
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className='text-center'>
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className='lead text-muted text-center'>Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
        </>
      )}
    </Page>
  )
}

export default Home
