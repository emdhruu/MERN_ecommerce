import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";
import AppLayout from "./layout/AppLayout";
import HomePage from "./pages/HomePage";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout/>,
      children: [
        {
          path: "/",
          element: <HomePage/>
        }
      ]
    }
  ]);

  return <div>
    <RouterProvider router={router}/>
    <Toaster position="top-right" reverseOrder={false} />
  </div>;
}

export default App;
