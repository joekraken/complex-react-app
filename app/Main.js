import React from "react"
import ReactDOM from "react-dom/client"
// custom React components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Footer from "./components/Footer"

function MainComponent() {
  return (
    <>
      <Header />
      <HomeGuest />
      <Footer />
    </>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<MainComponent />)

// load js asynchronously for dev
if (module.hot) {
  module.hot.accept()
}
