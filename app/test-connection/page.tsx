"use client"

import { useEffect, useState } from 'react'

export default function TestConnectionPage() {
  const [status, setStatus] = useState('Testing...')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Test basic fetch
    const testFetch = async () => {
      try {
        const response = await fetch('/api/health/redis')
        if (response.ok) {
          setStatus('✅ Basic fetch working')
        } else {
          setStatus('❌ Basic fetch failed')
        }
      } catch (error) {
        setStatus('❌ Basic fetch error')
        setErrors(prev => [...prev, `Fetch error: ${error}`])
      }
    }

    // Test console error monitoring
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args) => {
      const errorMsg = args.join(' ')
      if (errorMsg.includes('Connection closed') || errorMsg.includes('Minified React error')) {
        setErrors(prev => [...prev, `Console error: ${errorMsg}`])
      }
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const warnMsg = args.join(' ')
      if (warnMsg.includes('Connection') || warnMsg.includes('WebSocket')) {
        setErrors(prev => [...prev, `Console warning: ${warnMsg}`])
      }
      originalWarn.apply(console, args)
    }

    testFetch()

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Connection Test Page</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <p className="text-lg">{status}</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Errors Detected</h2>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="text-red-700 bg-red-100 p-2 rounded">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Instructions</h2>
        <p className="text-blue-700 mb-2">
          1. Open browser console (F12) to monitor for errors
        </p>
        <p className="text-blue-700 mb-2">
          2. Check if "Connection closed" errors still appear
        </p>
        <p className="text-blue-700 mb-2">
          3. Check if React error #423 still appears
        </p>
        <p className="text-blue-700">
          4. Refresh the page to test again
        </p>
      </div>
    </div>
  )
}
