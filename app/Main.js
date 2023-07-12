import React, { useState, useReducer, useEffect } from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Axios from "axios"
Axios.defaults.baseURL = "http://localhost:8080"
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

// custom React components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import CreatePost from "./components/CreatePost"
import ViewSinglePost from "./components/ViewSinglePost"
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"

function MainComponent() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("userToken")) && Boolean(localStorage.getItem("username")) && Boolean(localStorage.getItem("userAvatar")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("userToken"),
      username: localStorage.getItem("username"),
      avatar: localStorage.getItem("userAvatar")
    }
  }

  // immer passes a draft copy of the state
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.userData
        break
      case "logout":
        draft.loggedIn = false
        break
      case "flashMessage":
        draft.flashMessages.push(action.value)
      default:
        break
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

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
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
