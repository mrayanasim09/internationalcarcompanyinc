import { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'CSP Test - International Car Company Inc',
  description: 'Test page for Content Security Policy verification'
}

export default function CSPTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">CSP Test Page</h1>
        
        <div className="space-y-8">
          {/* Test 1: Google Analytics */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Test 1: Google Analytics</h2>
            <p className="text-muted-foreground mb-4">
              This should load without CSP violations if connect-src is properly configured.
            </p>
            <div id="ga-test" className="text-sm text-muted-foreground">
              Google Analytics test will run here...
            </div>
          </div>

          {/* Test 2: Web Vitals */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Test 2: Web Vitals</h2>
            <p className="text-muted-foreground mb-4">
              This should load without CSP violations if script-src-elem includes unpkg.com.
            </p>
            <div id="web-vitals-test" className="text-sm text-muted-foreground">
              Web Vitals test will run here...
            </div>
          </div>

          {/* Test 3: Google Fonts */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Test 3: Google Fonts</h2>
            <p className="text-muted-foreground mb-4">
              This should load without CSP violations if font-src includes fonts.gstatic.com.
            </p>
            <div className="text-sm text-muted-foreground">
              <p style={{ fontFamily: 'Montserrat, sans-serif' }}>
                This text uses Montserrat font from Google Fonts.
              </p>
            </div>
          </div>

          {/* Test 4: External Images */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Test 4: External Images</h2>
            <p className="text-muted-foreground mb-4">
              This should load without CSP violations if img-src includes necessary domains.
            </p>
            <div className="space-y-4">
              <img 
                src="https://via.placeholder.com/300x200/1e90ff/ffffff?text=Test+Image" 
                alt="Test placeholder image"
                className="rounded border"
              />
            </div>
          </div>

          {/* Test 5: CSP Status */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Test 5: CSP Status</h2>
            <p className="text-muted-foreground mb-4">
              Check the browser console and network tab for any CSP violations.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Check:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Browser console for CSP violation messages</li>
                <li>Network tab for blocked requests</li>
                <li>Server logs for CSP report submissions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Scripts */}
        <Script id="csp-test-ga" strategy="afterInteractive">
          {`
            // Test Google Analytics connection
            try {
              fetch('https://www.google-analytics.com/g/collect?v=2&tid=G-SV90G9ZG56&_p=123&cid=123&ul=en-us&sr=1280x720&_s=1&dt=CSP%20Test&dl=${encodeURIComponent(window.location.href)}&sid=123&sct=1&seg=1&_et=0&en=page_view', {
                method: 'POST',
                mode: 'no-cors'
              }).then(() => {
                document.getElementById('ga-test').innerHTML = '✅ Google Analytics connection successful';
              }).catch((error) => {
                document.getElementById('ga-test').innerHTML = '❌ Google Analytics connection failed: ' + error.message;
              });
            } catch (error) {
              document.getElementById('ga-test').innerHTML = '❌ Google Analytics test failed: ' + error.message;
            }
          `}
        </Script>

        <Script id="csp-test-web-vitals" strategy="afterInteractive">
          {`
            // Test Web Vitals loading
            try {
              import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js')
                .then(() => {
                  document.getElementById('web-vitals-test').innerHTML = '✅ Web Vitals loaded successfully';
                })
                .catch((error) => {
                  document.getElementById('web-vitals-test').innerHTML = '❌ Web Vitals failed to load: ' + error.message;
                });
            } catch (error) {
              document.getElementById('web-vitals-test').innerHTML = '❌ Web Vitals test failed: ' + error.message;
            }
          `}
        </Script>
      </div>
    </div>
  )
}
