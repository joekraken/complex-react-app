import React, { useState } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Axios from "axios"
Axios.defaults.baseURL = "http://localhost:8080"

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

function MainComponent() {
  const exist = Boolean(localStorage.getItem("userToken")) && Boolean(localStorage.getItem("username")) && Boolean(localStorage.getItem("userAvatar"))
  const [loggedIn, setLoggedIn] = useState(exist)
  const [flashMessages, setFlashMessages] = useState([])

  function addFlashMessage(msg) {
    setFlashMessages(prev => prev.concat(msg))
  }

  return (
    <BrowserRouter>
      <FlashMessages messages={flashMessages} />
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route path='/' element={loggedIn ? <Home /> : <HomeGuest />} />
        <Route path='/create-post' element={<CreatePost addFlashMessage={addFlashMessage} />} />
        <Route path='/post/:id' element={<ViewSinglePost />} />
        <Route path='/about-us' element={<About />} />
        <Route path='/terms' element={<Terms />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<MainComponent />)

// load js asynchronously for dev
if (module.hot) {
  module.hot.accept()
}
