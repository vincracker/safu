import { useState } from "react";

import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

import logo from "../../assets/images/logo.png";

export default function HomeNav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="w-screen py-5 relative">
      <div className=" w-11/12 md:max-w-7xl h-full mx-auto flex justify-between items-center">
        <Link to="/">
          <img src={logo} alt="logo" className="h-20" />
        </Link>
        <ul className="hidden  md:flex items-center text-primary font-Lato font-medium gap-x-12">
          <li className="">
            <Link to="/about">About</Link>
          </li>
          <li className="">
            <Link to="/faq">FAQ</Link>
          </li>
          <li className="text-white bg-primary px-5 py-2.5 rounded-lg">
            <Link to="/app">Launch App</Link>
          </li>
        </ul>
        <ul className="md:hidden flex items-center text-primary font-Lato font-medium gap-x-6">
          <li className="text-white text-sm bg-primary px-5 py-2 rounded-lg">
            <Link to="/app">Launch App</Link>
          </li>

          <li className="flex items-center">
            {!isOpen ? (
              <button onClick={() => setIsOpen(true)}>
                <GiHamburgerMenu size={30} />
              </button>
            ) : null}
          </li>
        </ul>
      </div>
      {
        <div
          className={`right-0 top-0  h-[calc(100vh-0rem)] md:hidden bg-primary  absolute w-64 translate-x-64 transition-all z-50  duration-300 ${
            isOpen ? "translate-x-0 " : "translate-x-64"
          } `}
        >
          <div className="w-full text-end p-6">
            <button onClick={() => setIsOpen(false)}>
              <IoCloseSharp size={30} color={"white"} />
            </button>
          </div>

          <ul className="flex flex-col items-center text-white font-Lato font-medium gap-y-6">
            <li className="">
              <Link to="/about">About</Link>
            </li>
            <li className="">
              <Link to="/faq">FAQ</Link>
            </li>
          </ul>
        </div>
      }
    </nav>
  );
}
