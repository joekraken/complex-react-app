import Axios from "axios"
import React, { useEffect, useState, useContext, useLayoutEffect } from "react"
import { Link, useParams } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"

function ProfileFollow(props) {
  const action = props.action
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [isLoading, setIsLoading] = useState(true)
  const [follows, setFollows] = useState([])

  // run on initial load when 2nd param is empty [] array
  useLayoutEffect(() => {
    // use an abort controller to cancel an Axios request, if React component is unmounted
    const requestController = new AbortController()

    async function fetchfollows() {
      try {
        setIsLoading(true)
        const response = await Axios.get(`/profile/${username}/${action}`, { signal: requestController.signal })
        setFollows(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("ERROR: there is a problem")
        console.log(e)
      }
    }
    fetchfollows()
    // return a clean up function, when component is unmounted (not rendered)
    return () => {
      requestController.abort()
    }
  }, [username, action])

  // check if follows user array is loading or retrieved from database
  if (isLoading) return <LoadingDotsIcon />
  else {
    // check if length of follows user array
    if (follows.length > 0) {
      return (
        <div className='list-group'>
          {follows.map((follow, index) => {
            return (
              <Link key={index} to={`/profile/${follow.username}`} className='list-group-item list-group-item-action'>
                <img className='avatar-tiny' src={follow.avatar} /> {follow.username}
              </Link>
            )
          })}
        </div>
      )
    } else {
      // else the follows user array is empty
      return (
        <div className='list-group-item text-muted text-center'>
          {action == "followers" && (appState.user.username == username ? "You have " : "This user has ") + "no followers."}
          {action == "following" && (appState.user.username == username ? "You are " : "This user is ") + "not following anyone."}
        </div>
      )
    }
  }
}

export default ProfileFollow
