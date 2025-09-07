'use client';

import { useState } from 'react';
import { 
  FiUploadCloud, 
  FiGrid, 
  FiSearch, 
  FiFile, 
  FiDownload, 
  FiHardDrive, 
  FiClock,
  FiFilter,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import FileList from '@/components/FileList';
import UploadForm from '@/components/UploadForm';

export default function Home() {
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setIsUploadMode(true);
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 font-inter antialiased transition-colors duration-300 ${
        isDragActive ? 'bg-blue-50/50 dark:bg-blue-950/50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-blue-200 dark:border-blue-800">
            <FiUploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce" />
            <p className="text-xl font-semibold text-gray-900 dark:text-white text-center">
              Drop your files here to upload
            </p>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                FileVault
              </span>
              <div className="hidden md:block">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsUploadMode(false)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${!isUploadMode 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                  >
                    Files
                  </button>
                  <button
                    onClick={() => setIsUploadMode(true)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isUploadMode 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="downloads">Sort by Downloads</option>
              </select>
              <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsUploadMode(!isUploadMode)}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            >
              {isUploadMode ? (
                <>
                  <FiGrid className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  View Files
                </>
              ) : (
                <>
                  <FiUploadCloud className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <FiFile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">128</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <FiDownload className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Downloads</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">2.4K</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <FiHardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">4.2 GB</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <FiClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Upload</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">2h ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section
          className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/70 p-8 md:p-12 transition-all duration-500 hover:shadow-blue-500/10 overflow-hidden"
        >
          {/* Decorative gradient glow */}
          <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-tr from-blue-500/5 via-transparent to-indigo-500/5"></div>

          {isUploadMode ? (
            <div className="relative">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Upload Files
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Drag & drop files or use the upload form below
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Max file size: <span className="font-medium text-gray-700 dark:text-gray-300">100MB</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Supported formats: All file types
                  </p>
                </div>
              </div>
              <UploadForm />
            </div>
          ) : (
            <div className="relative">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Your Files
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {searchTerm 
                    ? `Showing results for "${searchTerm}"`
                    : "Browse and manage your uploaded files"
                  }
                </p>
              </div>
              <FileList />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
