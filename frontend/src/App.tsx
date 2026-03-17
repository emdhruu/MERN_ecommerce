import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";
import UserLayout from "./layout/UserLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./layout/AdminLayout";
import Product from "./pages/Product";
import ProtectedRoute from "./routeGaurds/ProtectedRoute";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./features/auth/components/Login";
import VerifyOtp from "./features/auth/components/VerifyOtp";
import Register from "./features/auth/components/Register";
import AuthLayout from "./layout/AuthLayout";
import Profile from "./features/profile/components/Profile";

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
          element: <ProtectedRoute requireAuth requiredRole="user">
                      <Cart/>
                  </ProtectedRoute>
        },
        { 
          path: "checkout", 
          element: <ProtectedRoute requireAuth requiredRole="user">
                    <Checkout/>
                  </ProtectedRoute>
        },
        {
          path: "profile",
          element: <ProtectedRoute requireAuth requiredRole="user">
                    <Profile/>
                  </ProtectedRoute>
        }
      ]
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute requireAuth requiredRole="admin">
          <AdminLayout/>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard/>
        }
      ]
    },
    {
      path: "/",
      element: <AuthLayout/>,
      children: [
        {
          path: "login",
          element: <Login/>
        },
        {
          path: "register",
          element: <Register/>
        }
      ]
    },
    {
      path: "verify-otp",
      element: <ProtectedRoute requireAuth requireVerified>
                <VerifyOtp/>
              </ProtectedRoute>
    },
    {
      path: "*",
      element: <div>404 Not Found</div>
    }
  ]);

  return <div className="min-h-screen ">
    <RouterProvider router={router}/>
    <Toaster position="top-right" reverseOrder={false} />
  </div>;
}

export default App;
