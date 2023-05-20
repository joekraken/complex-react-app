import React from "react"
import ReactDOM from "react-dom/client"

function ExampleComponent() {
  return (
    <div>
      <h1>our app</h1>
      <p>sky is blue w/ white clouds</p>
    </div>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<ExampleComponent />)

// load js asynchronously for dev
if (module.hot) {
  module.hot.accept()
}
