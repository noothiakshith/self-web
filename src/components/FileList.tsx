'use client'

import { useState, useEffect } from 'react'
import { formatDistance } from 'date-fns'
import Image from 'next/image'
import { getCache, setCache } from '@/lib/cache'
import {
  FiFile,
  FiDownload,
  FiImage,
  FiMusic,
  FiVideo,
  FiFileText,
} from 'react-icons/fi'

interface File {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  downloads: number
}

export default function FileList() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = getCache<File[]>();
    if (cached) {
      setFiles(cached);
      setLoading(false);
    }
    fetchFiles();
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      setFiles(data)
      setCache(data)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadFile = async (id: string) => {
    try {
      window.open(`/api/files/${id}/download`, '_blank')
      await fetchFiles() // refresh to update download count
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const getFileIcon = (type: string) => {
    const iconClass = "w-12 h-12";
    if (type.startsWith('image')) return <FiImage className={`${iconClass} text-pink-500`} />
    if (type.startsWith('video')) return <FiVideo className={`${iconClass} text-indigo-500`} />
    if (type.startsWith('audio')) return <FiMusic className={`${iconClass} text-green-500`} />
    if (type.includes('pdf')) return <FiFileText className={`${iconClass} text-red-500`} />
    if (type.includes('word') || type.includes('document')) return <FiFileText className={`${iconClass} text-blue-500`} />
    if (type.includes('excel') || type.includes('spreadsheet')) return <FiFileText className={`${iconClass} text-green-600`} />
    if (type.includes('powerpoint') || type.includes('presentation')) return <FiFileText className={`${iconClass} text-orange-500`} />
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <FiFileText className={`${iconClass} text-yellow-500`} />
    return <FiFile className={`${iconClass} text-gray-500`} />
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading files...</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
        >
          {/* Thumbnail/Icon Container */}
          <div className="aspect-square relative bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            {file.type.startsWith('image/') ? (
              <Image
                src={`/api/files/${file.id}/download`}
                alt={file.name}
                width={200}
                height={200}
                className="object-cover w-full h-full rounded"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`text-4xl ${file.type.startsWith('image/') ? 'hidden' : ''}`}>
              {getFileIcon(file.type)}
            </div>
          </div>

          {/* File Info */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-1" title={file.name}>
              {file.name}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{formatFileSize(file.size)}</span>
              <span>{file.downloads} downloads</span>
            </div>
          </div>

          {/* Download Button - Appears on Hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={() => downloadFile(file.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiDownload className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* Upload Date - Small Badge */}
          <div className="absolute top-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded-full">
            {formatDistance(new Date(file.uploadDate), new Date(), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}
