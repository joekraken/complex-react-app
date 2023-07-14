import React, { useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import Page from "./Page"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import { useImmer } from "use-immer"

function Profile(props) {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  })

  // retrieve user profiel data, posts, and following
  useEffect(() => {
    // use an abort controller to cancel an Axios request, if React component is unmounted
    const requestController = new AbortController()
    // useEffect doesn't accept async functions
    // so, create & execute within passed function
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token, signal: requestController.signal })
        setState(draft => {
          draft.profileData = response.data
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
  }, [username])

  // start following user behavior
  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      // use an abort controller to cancel an Axios request, if React component is unmounted
      const requestController = new AbortController()
      // useEffect doesn't accept async functions
      // so, create & execute within passed function
      async function fetchData() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token, signal: requestController.signal })
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
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
    }
  }, [state.startFollowingRequestCount])

  // stop following user behavior
  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState(draft => {
        draft.followActionLoading = true
      })
      // use an abort controller to cancel an Axios request, if React component is unmounted
      const requestController = new AbortController()
      // useEffect doesn't accept async functions
      // so, create & execute within passed function
      async function fetchData() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token, signal: requestController.signal })
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
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
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title='Profile Screen'>
      <h2>
        <img className='avatar-small' src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className='btn btn-primary btn-sm ml-2'>
            Follow <i className='fas fa-user-plus'></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className='btn btn-danger btn-sm ml-2'>
            Stop Following <i className='fas fa-user-times'></i>
          </button>
        )}
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <a href='#' className='active nav-item nav-link'>
          Posts: {state.profileData.counts.postCount}
        </a>
        <a href='#' className='nav-item nav-link'>
          Followers: {state.profileData.counts.followerCount}
        </a>
        <a href='#' className='nav-item nav-link'>
          Following: {state.profileData.counts.followingCount}
        </a>
      </div>

      <ProfilePosts />
    </Page>
  )
}

export default Profile
