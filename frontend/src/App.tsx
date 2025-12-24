import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";
import UserLayout from "./layout/UserLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/admin/Dashboard";
import LoginPage from "./pages/LoginPage";
import AdminRoute from "./routeGaurds/AdminRoute";
import AdminLayout from "./layout/AdminLayout";
import Product from "./pages/Product";
import ProtectedRoute from "./routeGaurds/ProtectedRoute";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <UserLayout/>,
      children: [
        { 
          index: true, 
          element: <Home/> 
        },
        { 
          path: "product/:id", 
          element: <Product/> 
        },
        { 
          path: "cart", 
          element: <ProtectedRoute><Cart/></ProtectedRoute>
        },
        { 
          path: "checkout", 
          element: <ProtectedRoute><Checkout/></ProtectedRoute>
        }
      ]
    },
    {
      path: "/admin",
      element: (
        <AdminRoute>
          <AdminLayout/>
        </AdminRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard/>
        }
      ]
    },
    {
      path: "/login",
      element: <LoginPage/>
    },
    {
      path: "*",
      element: <div>404 Not Found</div>
    }
  ]);

  return <div>
    <RouterProvider router={router}/>
    <Toaster position="top-right" reverseOrder={false} />
  </div>;
}

export default App;
