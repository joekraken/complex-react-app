import React, { useContext, useEffect } from "react"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import { useImmer } from "use-immer"
import Axios from "axios"

function Search(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  // like set state
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  })

  // listen for search input change
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = "loading"
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 800)

      // clean up function clears timeout if key pressed before timer ends
      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  // listen for requests, then call backend
  useEffect(() => {
    if (state.requestCount) {
      const requestController = new AbortController()
      async function fetchResults() {
        try {
          const response = await Axios.post("/search", { searchTerm: state.searchTerm }, { signal: requestController.signal })
          setState(draft => {
            draft.results = response.data
            draft.show = "results"
          })
        } catch (e) {
          console.log("Error occured fetching search results.")
          console.log(e)
        }
      }
      fetchResults()
      // clean up
      return () => requestController.abort()
    }
  }, [state.requestCount])

  // listen for key press
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    // return a clean up function to remove event listener
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  // event handler to listen for key press
  function searchKeyPressHandler(e) {
    // check for escape key press
    if (e.keyCode == 27) {
      appDispatch({ type: "closeSearch" })
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }

  return (
    <div className='search-overlay'>
      <div className='search-overlay-top shadow-sm'>
        <div className='container container--narrow'>
          <label htmlFor='live-search-field' className='search-overlay-icon'>
            <i className='fas fa-search'></i>
          </label>
          <input onChange={handleInput} autoFocus type='text' autoComplete='off' id='live-search-field' className='live-search-field' placeholder='What are you interested in?' />
          <span onClick={() => appDispatch({ type: "closeSearch" })} className='close-live-search'>
            <i className='fas fa-times-circle'></i>
          </span>
        </div>
      </div>

      <div className='search-overlay-bottom'>
        <div className='container container--narrow py-3'>
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>
            <div className='list-group shadow-sm'>
              <div className='list-group-item active'>
                <strong>Search Results</strong> ({state.results.length} {state.results.length == 1 ? "item" : "items"} found)
              </div>
              {state.results.map(post => {})}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
