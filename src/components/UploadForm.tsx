'use client'

import { useState } from 'react'
import { getCache, setCache } from '@/lib/cache'

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('password', password)

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Upload failed')
      }

      const data = await response.json()
      
      // Update the cache with the new file
      const cachedFiles = getCache<File[]>();
      if (cachedFiles) {
        setCache([data, ...cachedFiles]);
      }
      
      setSuccess(true)
      setFile(null)
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 space-y-5 border border-gray-100"
    >
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Upload Your File
      </h2>

      {/* File Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select File
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700
                     file:mr-4 file:py-2.5 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-medium
                     file:bg-blue-50 file:text-blue-600
                     hover:file:bg-blue-100
                     cursor-pointer border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
          required
        />
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 
                     bg-gray-50 text-gray-800 placeholder-gray-400
                     focus:ring-2 focus:ring-purple-400 focus:border-purple-500 
                     transition shadow-sm"
          placeholder="Enter password..."
          required
        />
      </div>

      {/* Error & Success */}
      {error && (
        <div className="p-3 text-red-600 bg-red-50 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-green-600 bg-green-50 border border-green-200 rounded-lg text-sm">
          ✅ File uploaded successfully!
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium shadow-md transition disabled:opacity-60"
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </form>
  )
}
