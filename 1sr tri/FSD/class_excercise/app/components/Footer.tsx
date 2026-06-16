'use client';

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Skills', href: '/skills' },
    { name: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/Vishwaxs', icon: 'fab fa-github' },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/vishwas-vashishtha', icon: 'fab fa-linkedin' },
    { name: 'Twitter', href: 'https://twitter.com/vishwasvashishtha', icon: 'fab fa-twitter' },
    { name: 'Email', href: 'mailto:vishwasvashishtha@mca.christuniversity.in', icon: 'fas fa-envelope' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Portfolio
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
              Full Stack Developer passionate about creating exceptional digital experiences with modern web technologies.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                  aria-label={link.name}
                >
                  <i className={link.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope w-4 text-center"></i>
                <span>vishwasvashishtha@mca.christuniversity.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone w-4 text-center"></i>
                <span>+91 7060200434</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-map-marker-alt w-4 text-center"></i>
                <span>Bangalore, Karnataka</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {currentYear} Vishwas Vashishtha. Built with Next.js and Tailwind CSS.
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
