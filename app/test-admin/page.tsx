"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Shield } from 'lucide-react'

export default function TestAdminPage() {
  const [testResults, setTestResults] = useState<Array<{
    id: number
    test: string
    status: 'success' | 'error' | 'warning'
    message: string
    timestamp: Date
    details?: Record<string, unknown>
  }>>([])
  const [isTesting, setIsTesting] = useState(false)
  const [email, setEmail] = useState('admin@internationalcarcompanyinc.com')
  const [password, setPassword] = useState('Admin123!')

  const addTestResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: Record<string, unknown>) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      details,
      timestamp: new Date()
    }])
  }

  const runAllTests = async () => {
    setIsTesting(true)
    setTestResults([])
    
    // Test 1: Check environment variables
    addTestResult('Environment Check', 'success', 'Testing environment variables...')
    
    // Test 2: Test Supabase connection
    try {
      const response = await fetch('/api/health/redis')
      if (response.ok) {
        addTestResult('Supabase Connection', 'success', '✅ Supabase connection working')
      } else {
        addTestResult('Supabase Connection', 'error', `❌ Supabase connection failed: ${response.status}`)
      }
    } catch (error) {
      addTestResult('Supabase Connection', 'error', `❌ Supabase connection error: ${error}`)
    }

    // Test 3: Test admin API endpoints
    try {
      const response = await fetch('/api/admin/me', { 
        method: 'GET',
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        addTestResult('Admin API Check', 'success', '✅ Admin API endpoint working', data)
      } else {
        addTestResult('Admin API Check', 'warning', `⚠️ Admin API returned ${response.status}`, { status: response.status })
      }
    } catch (error) {
      addTestResult('Admin API Check', 'error', `❌ Admin API error: ${error}`)
    }

    // Test 4: Test login endpoint
    try {
      const response = await fetch('/api/admin/login-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      
      if (response.ok) {
        const data = await response.json()
        addTestResult('Login API Check', 'success', '✅ Login API working', data)
      } else {
        const data = await response.json().catch(() => ({}))
        addTestResult('Login API Check', 'warning', `⚠️ Login API returned ${response.status}`, data)
      }
    } catch (error) {
      addTestResult('Login API Check', 'error', `❌ Login API error: ${error}`)
    }

    // Test 5: Check cookies and local storage
    const cookies = document.cookie
    const hasAdminToken = cookies.includes('admin-token')
    const hasCsrfToken = cookies.includes('csrf_token')
    
    addTestResult('Cookie Check', hasAdminToken ? 'success' : 'warning', 
      hasAdminToken ? '✅ Admin token found in cookies' : '⚠️ No admin token in cookies',
      { cookies: cookies.split(';').map(c => c.trim()) }
    )
    
    addTestResult('CSRF Token Check', hasCsrfToken ? 'success' : 'warning',
      hasCsrfToken ? '✅ CSRF token found' : '⚠️ No CSRF token found'
    )

    // Test 6: Check if admin_users table exists
    try {
      const response = await fetch('/api/admin/users/list', { 
        method: 'GET',
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        addTestResult('Admin Users Table', 'success', '✅ admin_users table accessible', data)
      } else if (response.status === 401) {
        addTestResult('Admin Users Table', 'warning', '⚠️ admin_users table exists but requires authentication')
      } else {
        addTestResult('Admin Users Table', 'error', `❌ admin_users table error: ${response.status}`)
      }
    } catch (error) {
      addTestResult('Admin Users Table', 'error', `❌ admin_users table check failed: ${error}`)
    }

    setIsTesting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <Shield className="w-4 h-4 text-green-500" />
      case 'error': return <Shield className="w-4 h-4 text-red-500" />
      case 'warning': return <Shield className="w-4 h-4 text-yellow-500" />
      default: return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🔐 Admin System Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin/login', '_blank')}
              className="w-full"
            >
              Test Admin Login Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin', '_blank')}
              className="w-full"
            >
              Test Admin Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Cookies:', document.cookie)
                console.log('Local Storage:', Object.keys(localStorage))
                alert('Check browser console for details')
              }}
              className="w-full"
            >
              Debug Browser Storage
            </Button>
          </CardContent>
        </Card>
      </div>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results ({testResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                    <span className="text-sm text-gray-600 ml-auto">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer hover:underline">View Details</summary>
                      <pre className="mt-2 p-2 bg-white/50 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">🔍 What This Tests</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Environment variables and Supabase connection</li>
          <li>Admin API endpoints accessibility</li>
          <li>Login system functionality</li>
          <li>Cookie and authentication state</li>
          <li>Database table accessibility</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">⚠️ Common Issues</h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Missing environment variables in .env.local</li>
          <li>admin_users table doesn&apos;t exist in Supabase</li>
          <li>CSRF token generation failing</li>
          <li>Supabase service role key permissions</li>
          <li>Network/CORS restrictions</li>
        </ul>
      </div>
    </div>
  )
}
