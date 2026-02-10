import { Route, Routes } from "react-router-dom"
import NotFound from "./NotFound"
import Home from "../pages/Home"
import Canvas from "../pages/Canvas"


const MainRoute = () => {
  return (
    <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/canvas" element={<Canvas/>}/>
        <Route path="*" element={<NotFound/>}></Route>
    </Routes>
  )
}

export default MainRoute