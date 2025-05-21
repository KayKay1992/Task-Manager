import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineX, HiOutlineMenu } from 'react-icons/hi';
import SideMenu from './SideMenu';

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenSideMenu(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpenSideMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='flex gap-5 bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30'>
      {/* Mobile menu toggle */}
      <button
        className='lg:hidden text-black'
        onClick={() => setOpenSideMenu(!openSideMenu)}
        aria-label={openSideMenu ? 'Close menu' : 'Open menu'}
        aria-expanded={openSideMenu}
      >
        {openSideMenu ? (
          <HiOutlineX className='text-2xl' />
        ) : (
          <HiOutlineMenu className='text-2xl' />
        )}
      </button>

      <h2 className="text-lg font-medium text-black">Task Manager</h2>

      {/* Mobile side menu */}
      {openSideMenu && (
        <div
          ref={menuRef}
          className="lg:hidden fixed top-[61px] left-0 right-0 bg-white shadow-lg z-40 transition-all duration-300 ease-in-out"
        >
          <SideMenu
            activeMenu={activeMenu}
            isMobile={true}
            closeMenu={() => setOpenSideMenu(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Navbar;
