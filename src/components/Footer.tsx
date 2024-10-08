import { Sun } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white py-4 mt-8 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <Sun size={12} className="text-yellow-400 mr-2 rotating-sun" />
        <span className="text-xs text-gray-500">Crafted in Tampa, Florida</span>
      </div>
    </footer>
  );
};

export default Footer;