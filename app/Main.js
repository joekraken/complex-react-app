import React, { useState, useReducer, useEffect, Suspense } from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
Axios.defaults.baseURL = "http://localhost:8080"
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

// custom React components
import LoadingDotsIcon from "./components/LoadingDotsIcon"
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"

// * Lazy loaded custom React components (with corresponding import statement) *
// import CreatePost from "./components/CreatePost"
// import ViewSinglePost from "./components/ViewSinglePost"
// import Search from "./components/Search"
// import Chat from "./components/Chat"
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
const Search = React.lazy(() => import("./components/Search"))
const Chat = React.lazy(() => import("./components/Chat"))

function MainComponent() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("userToken")) && Boolean(localStorage.getItem("username")) && Boolean(localStorage.getItem("userAvatar")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("userToken"),
      username: localStorage.getItem("username"),
      avatar: localStorage.getItem("userAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }

  // immer passes a draft copy of the state
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        return
      default:
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  // listen to changes to state.loggedIn
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("userToken", state.user.token)
      localStorage.setItem("username", state.user.username)
      localStorage.setItem("userAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("userToken")
      localStorage.removeItem("username")
      localStorage.removeItem("userAvatar")
    }
  }, [state.loggedIn])

  // check if token has expired, on first app render
  useEffect(() => {
    if (state.loggedIn) {
      const requestController = new AbortController()
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { signal: requestController.signal })
          // if false, then token is invalid
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." })
          }
        } catch (e) {
          console.log("Error occured fetching search results.")
          console.log(e)
        }
      }
      fetchResults()
      // clean up
      return () => requestController.abort()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path='/' element={state.loggedIn ? <Home /> : <HomeGuest />} />
              <Route path='/profile/:username/*' element={<Profile />} />
              <Route path='/create-post' element={<CreatePost />} />
              <Route path='/post/:id' element={<ViewSinglePost />} />
              <Route path='/post/:id/edit' element={<EditPost />} />
              <Route path='/about-us' element={<About />} />
              <Route path='/terms' element={<Terms />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Suspense>
          <CSSTransition timeout={400} in={state.isSearchOpen} classNames={"search-overlay"} unmountOnExit>
            <div className='search-overlay'>
              <Suspense fallback=''>
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback=''>{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<MainComponent />)

// load js asynchronously for dev
if (module.hot) {
  module.hot.accept()
}
