// frontend/src/components/Header.jsx
import React from "react";
import Logo from "../constants/Logo.svg";

const Header = () => {
  return (
    <header className="flex items-center justify-between py-4 px-6 bg-transparent">
      <div className="flex items-center gap-4">
        <img src={Logo} alt="NewsSum" className="w-[220px] h-auto" />
      </div>
      <div className="text-sm text-gray-500">AI-powered news summarization</div>
    </header>
  );
};

export default Header;
