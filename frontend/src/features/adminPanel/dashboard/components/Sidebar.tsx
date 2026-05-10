import { useLogoutMutation } from '@/features/auth/authApi';
import { Box, ChevronLeft, ChevronRight, ClipboardList, Handbag, Library, LogOut, Notebook, Settings, ShieldCheck, Tag, Users, FileText, BookOpen, Ticket, Receipt, SlidersHorizontal } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [logout, {isLoading}] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = [
    {
      name: "Dashboard",
      icon: <Library />,
      link: "/admin/dashboard",
    },
    {
      name: "Product",
      icon: <Box />,
      link: "/admin/productManagement",
    },
    {
      name: "Categories",
      icon: <Tag />,
      link: "/admin/categories",
    },
    {
      name: "Brand",
      icon: <ShieldCheck/>,
      link: "/admin/brands",
    },
    {
      name: "Orders",
      icon: <ClipboardList />,
      link: "/admin/orders",
    },
    {
      name: "Inventory",
      icon: <Notebook/>,
      link: "/admin/inventory",
    },
    {
      name: "Purchase Orders",
      icon: <FileText />,
      link: "/admin/inventory/purchase-orders",
    },
    {
      name: "Ledger",
      icon: <BookOpen />,
      link: "/admin/inventory/ledger",
    },
    {
      name: "Coupons",
      icon: <Ticket />,
      link: "/admin/coupons",
    },
    {
      name: "Invoices",
      icon: <Receipt />,
      link: "/admin/invoices",
    },
    {
      name: "Configuration",
      icon: <SlidersHorizontal />,
      link: "/admin/configuration",
    },
    {
      name: "Users",
      icon: <Users />,
      link: "/admin/users",
    },
    {
      name: "Settings",
      icon: <Settings />,
      link: "/admin/settings",
    }];

    const handleLogout = async () => {
        await logout({});
        navigate("/login");
    }

  return (
    <>
      {/* Backdrop - Only visible when sidebar is expanded on medium/mobile */}
      {isOpen && (
        <div
          className="md:block lg:hidden fixed inset-0 backdrop-blur-xs backdrop-opacity-90 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen p-3 bg-gradient-to-b from-[#f05249] via-[#ed6d67] to-[#f8b4ab] text-black z-50 transition-all duration-300 ease-in-out
        lg:w-60
        ${isOpen ? 'w-60' : 'w-16'}
      `}>
        {/* Header */}
        <div className='flex items-center gap-2 text-2xl font-bold mb-8'>
          <Handbag />
          <Link to="/" className={`${isOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>MERN-eKART</Link>
        </div>
        
        {/* Menu Items */}
        <div>
          <span className={`${isOpen ? 'block' : 'hidden'} lg:block text-sm opacity-70 mb-2 transition-all duration-300`}>General</span>
          {menuItems.map((item, idx) => (
            <div className='flex flex-row space-y-2' key={idx}>
              <Link 
                to={item.link}
                onClick={() => setIsOpen(false)}
                className="w-full"
                title={!isOpen ? item.name : ''}
              >
                <span className={`flex items-center gap-2 text-lg font-medium p-2 rounded-md transition-colors w-full ${
                  location.pathname === item.link ? 'bg-white/25' : 'hover:bg-white/15'
                } ${isOpen ? 'justify-start' : 'justify-center'} lg:justify-start`}>
                  {item.icon}
                  <span className={`${isOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>{item.name}</span>
                </span>
              </Link>
            </div>
          ))}
        </div>
        
        {/* Toggle Button - Above logout, only visible on medium screens */}
        <div className='absolute bottom-16 left-3 right-3 md:block lg:hidden'>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-row items-center gap-2 text-lg font-medium p-2 rounded-md hover:bg-white/15 transition-colors w-full ${isOpen ? 'justify-start' : 'justify-center'}`}
            title={!isOpen ? 'Toggle Sidebar' : ''}
          >
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
            <span className={`${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>
              Toggle
            </span>
          </button>
        </div>
        
        {/* Logout Button */}
        <div className='absolute bottom-4 left-3 right-3'>
          <button 
            onClick={() => handleLogout()} 
            className={`flex flex-row items-center gap-2 text-lg font-medium p-2 rounded-md hover:bg-black/5 transition-colors w-full ${isOpen ? 'justify-start' : 'justify-center'} lg:justify-start`}
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut />
            <span className={`${isOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
              {isLoading ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar;