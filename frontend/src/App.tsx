import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Toaster } from "react-hot-toast";
import UserLayout from "./layout/UserLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./layout/AdminLayout";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./features/auth/components/Login";
import VerifyOtp from "./features/auth/components/VerifyOtp";
import Register from "./features/auth/components/Register";
import AuthLayout from "./layout/AuthLayout";
import Profile from "./features/profile/components/Profile";
import AuthGard from "./routeGaurds/AuthGard";
import VerificationGuard from "./routeGaurds/VerificationGuard";
import RoleGuard from "./routeGaurds/RoleGuard";
import AuthInitializer from "./features/auth/AuthInitialzer";

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
          element: <AuthGard>
                      <RoleGuard role="user">
                        <Cart/>
                      </RoleGuard>
                    </AuthGard>
        },
        { 
          path: "checkout", 
          element: <AuthGard>
                      <RoleGuard role="user">
                        <Checkout/>
                      </RoleGuard>
                    </AuthGard>
        },
        {
          path: "profile",
              element: <AuthGard>
                          <RoleGuard role="user">
                            <Profile/>
                          </RoleGuard>
                      </AuthGard>
          }
      ]
    },
    {
      path: "/admin",
      element: (
        <AuthGard>
          <RoleGuard role="admin">
            <AdminLayout/>
          </RoleGuard>
        </AuthGard>
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
      element: <VerificationGuard>
        <VerifyOtp/>
      </VerificationGuard>
    },
    {
      path: "*",
      element: <div>404 Not Found</div>
    }
  ]);

  return <div className="min-h-screen ">
    <AuthInitializer>
      <RouterProvider router={router}/>
      <Toaster position="top-right" reverseOrder={false} />
    </AuthInitializer>
  </div>;
}

export default App;
