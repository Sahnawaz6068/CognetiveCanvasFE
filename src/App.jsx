import { BrowserRouter } from "react-router-dom";
import MainRoute from "./Route/MainRoute";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster />

      <MainRoute />
    </>
  );
};

export default App;
