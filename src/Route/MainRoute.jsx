import { Route, Routes } from "react-router-dom"
import NotFound from "./NotFound"
import Home from "../pages/Home"
import SignIn from "../pages/Signin"
import Signup from "../pages/Signup"
import CanvasDashboard from "../pages/CanvasDashboard"
import GeneratePPT from "../pages/GeneratePPT"
import Canvas from "../pages/CanvasPage"



const MainRoute = () => {
  return (
    <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/canvas" element={<Canvas/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/dashboard" element={<CanvasDashboard/>}/>
        <Route path="/genppt" element={<GeneratePPT/>}/>
        <Route path="*" element={<NotFound/>}></Route>
    </Routes>
  )
}

export default MainRoute