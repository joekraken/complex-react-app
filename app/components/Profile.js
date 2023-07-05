import React, { useEffect, useContext, useState } from "react"
import { useParams } from "react-router-dom"
import Page from "./Page"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"

function Profile(props) {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [profileData, setProfileData] = useState({
    profileUsername: "...",
    profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
    isFollowing: false,
    counts: { postCount: "", followerCount: "", followingCount: "" }
  })

  useEffect(() => {
    // use an abort controller to cancel an Axios request, if React component is unmounted
    const requestController = new AbortController()
    // useEffect doesn't accept async functions
    // so, create & execute within passed function
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token, signal: requestController.signal })
        setProfileData(response.data)
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
  return (
    <Page title='Profile Screen'>
      <h2>
        <img className='avatar-small' src={profileData.profileAvatar} /> {profileData.profileUsername}
        <button className='btn btn-primary btn-sm ml-2'>
          Follow <i className='fas fa-user-plus'></i>
        </button>
      </h2>

      <div className='profile-nav nav nav-tabs pt-2 mb-4'>
        <a href='#' className='active nav-item nav-link'>
          Posts: {profileData.counts.postCount}
        </a>
        <a href='#' className='nav-item nav-link'>
          Followers: {profileData.counts.followerCount}
        </a>
        <a href='#' className='nav-item nav-link'>
          Following: {profileData.counts.followingCount}
        </a>
      </div>

      <ProfilePosts />
    </Page>
  )
}

export default Profile
