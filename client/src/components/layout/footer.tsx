import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-white mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="mt-4 flex justify-center space-x-6">
          <a href="#" className="text-slate-400 hover:text-slate-500">
            <span className="sr-only">Facebook</span>
            <FaFacebook className="h-5 w-5" />
          </a>
          <a href="#" className="text-slate-400 hover:text-slate-500">
            <span className="sr-only">Instagram</span>
            <FaInstagram className="h-5 w-5" />
          </a>
          <a href="#" className="text-slate-400 hover:text-slate-500">
            <span className="sr-only">Twitter</span>
            <FaTwitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-slate-400 hover:text-slate-500">
            <span className="sr-only">WhatsApp</span>
            <FaWhatsapp className="h-5 w-5" />
          </a>
        </div>
        <p className="mt-4 text-center text-base text-slate-500">
          &copy; {new Date().getFullYear()} ASAP Water Jars Delivery. Created by Uday. Email: upsc26112004@gmail.com
        </p>
      </div>
    </footer>
  );
}
