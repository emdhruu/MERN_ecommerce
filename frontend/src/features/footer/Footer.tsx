import { Handbag } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white text-lg font-bold mb-3">
              <Handbag size={20} />
              MERN-eKART
            </div>
            <p className="text-sm text-gray-400">Your one-stop shop for quality products at great prices.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-medium mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/products" className="hover:text-white transition-colors">Products</Link>
              <Link to="/cart" className="hover:text-white transition-colors">Cart</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <p>support@mern-ekart.com</p>
              <p>+1 234 567 890</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MERN-eKART. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
