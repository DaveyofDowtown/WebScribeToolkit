import { useTheme } from "./ThemeProvider";

export function Header() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
              <i className="fas fa-running"></i>
            </div>
            <h1 className="text-xl font-semibold">M2E Crypto Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" 
              onClick={toggleTheme}
            >
              <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <i className="fas fa-user"></i>
                </div>
                <span className="hidden sm:inline-block">User</span>
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
