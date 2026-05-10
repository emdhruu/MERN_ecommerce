import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut, Handbag } from "lucide-react";
import { useAppSelector } from "@/app/hook";
import { useLogoutMutation } from "@/features/auth/authApi";
import { useGetCartQuery } from "@/features/store/storeApi";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const { data: cartData } = useGetCartQuery(undefined, {
    skip: status !== "authenticated" || user?.role !== "user",
  });
  const cartCount = cartData?.cartItems?.items?.length || 0;

  const handleLogout = async () => {
    await logout({});
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[#D54F47]">
            <Handbag size={24} />
            MERN-eKART
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-[#D54F47] transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-[#D54F47] transition-colors">
              Products
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {status === "authenticated" && user?.role === "user" && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#D54F47] transition-colors">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D54F47] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {status === "authenticated" ? (
              <div className="flex items-center gap-3">
                <Link to={user?.role === "admin" ? "/admin/dashboard" : "/profile"} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#D54F47]">
                  <User size={18} />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-[#D54F47] transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#D54F47] px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-medium bg-[#D54F47] text-white px-4 py-2 rounded-lg hover:bg-[#b8433c] transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
