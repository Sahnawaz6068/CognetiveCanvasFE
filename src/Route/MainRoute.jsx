import { Route, Routes, Navigate } from "react-router-dom";

import NotFound from "./NotFound";
import Home from "../pages/Home";
import SignIn from "../pages/Signin";
import Signup from "../pages/Signup";
import CanvasDashboard from "../pages/CanvasDashboard";
import GeneratePPT from "../pages/GeneratePPT";
import Canvas from "../pages/CanvasPage";
import ViewPPT from "../pages/ViewPPT";
import RealTime from "../pages/RealTime";
import Collab from "../pages/Collab";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const MainRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/canvas" element={<Canvas />} />

      {/* PROTECTED ROUTES */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CanvasDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/genppt"
        element={
          <ProtectedRoute>
            <GeneratePPT />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ppt/:id"
        element={
          <ProtectedRoute>
            <ViewPPT />
          </ProtectedRoute>
        }
      />

      <Route
        path="/real-time"
        element={
          <ProtectedRoute>
            <RealTime />
          </ProtectedRoute>
        }
      />

      <Route
        path="/collab/:roomId"
        element={
          <ProtectedRoute>
            <Collab />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoute;
