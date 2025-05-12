export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">&copy; 2023 M2E Crypto Tracker. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <i className="fab fa-discord"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <i className="fab fa-telegram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
