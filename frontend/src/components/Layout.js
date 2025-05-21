import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, PhoneIcon, UserCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Callbacks', href: '/callbacks' },
  { name: 'Orders', href: '/orders' },
  { name: 'Products', href: '/products' },
  // Add more navigation items here as you build them
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top banner */}
      <div className="bg-primary-600 text-white py-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm">
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 mr-1" />
            <span>1-833-597-0070</span>
          </div>
          <div>
            <span>orders@autoxpress.us</span>
          </div>
        </div>
      </div>

      {/* Top navigation */}
      <header className="bg-white shadow-md">
        <nav className="mx-auto max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-bold">AX</span>
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-gray-900">AutoXpress</h1>
                  <p className="text-xs font-medium text-primary-600">OEM & Aftermarket Auto Parts</p>
                </div>
              </Link>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href || (item.href === '/' && location.pathname === '/')
                      ? 'text-primary-600 font-semibold border-b-2 border-primary-500'
                      : 'text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-primary-300',
                    'text-sm font-medium leading-6 px-1 py-2 transition-all duration-150'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-150">
                <ChartBarIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">Reports</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-150">
                <UserCircleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">Admin</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 z-10 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AX</span>
                  </div>
                  <h1 className="text-lg font-extrabold text-gray-900">AutoXpress</h1>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          location.pathname === item.href || (item.href === '/' && location.pathname === '/')
                            ? 'bg-primary-50 text-primary-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                          'block rounded-lg px-3 py-2 text-base font-medium leading-7'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="py-6">
                    <div className="space-y-2">
                      <a href="tel:1-833-597-0070" className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        <span>1-833-597-0070</span>
                      </a>
                      <a href="mailto:orders@autoxpress.us" className="flex items-center -mx-3 rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span>orders@autoxpress.us</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white mt-auto border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center mr-2">
                <span className="text-white text-sm font-bold">AX</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">AutoXpress</h2>
                <p className="text-xs text-gray-500">OEM & Aftermarket Auto Parts</p>
              </div>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors duration-150">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors duration-150">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors duration-150">Contact Us</a>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AutoXpress. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}