import Axios from "axios"
import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts(props) {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  // run on initial load when 2nd param is empty [] array
  useEffect(() => {
    // use an abort controller to cancel an Axios request, if React component is unmounted
    const requestController = new AbortController()

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { signal: requestController.signal })
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("ERROR: there is a problem")
        console.log(e)
      }
    }
    fetchPosts()
    // return a clean up function, when component is unmounted (not rendered)
    return () => {
      requestController.abort()
    }
  }, [username])

  // check if posts are loading or retrieved from db
  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className='list-group'>
      {posts.map(post => {
        return <Post post={post} key={post._id} showAuthor={true} />
      })}
    </div>
  )
}

export default ProfilePosts
