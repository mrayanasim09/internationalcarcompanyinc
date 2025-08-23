import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, Globe, Server, Key } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security Policy - International Car Company Inc',
  description: 'Learn about our security measures, privacy practices, and data protection policies.',
}

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Security Policy</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We take security seriously. Learn about the measures we implement to protect your data and ensure a secure experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Content Security Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Comprehensive CSP implementation to prevent XSS attacks and unauthorized resource loading.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>HTTPS Enforcement</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>All communications are encrypted using TLS 1.3 and strict transport security headers.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Privacy Protection</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Strict referrer policies and cross-origin controls to protect user privacy.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Frame Protection</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>X-Frame-Options and CSP frame-ancestors to prevent clickjacking attacks.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>API Security</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Rate limiting, CSRF protection, and input validation on all API endpoints.</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Multi-factor authentication, secure session management, and JWT tokens.</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Security Headers Implemented</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Content Security Policy (CSP)</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive policy preventing XSS, clickjacking, and unauthorized resource loading.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Strict Transport Security (HSTS)</h3>
                  <p className="text-sm text-muted-foreground">
                    Enforces HTTPS connections with a 6-month minimum duration.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">X-Frame-Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Prevents clickjacking attacks by controlling frame embedding.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">X-Content-Type-Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Prevents MIME type sniffing attacks.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Referrer Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    Controls referrer information to protect user privacy.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Cross-Origin Resource Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    Restricts cross-origin resource loading for enhanced security.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Report Security Issues</h2>
          <p className="text-muted-foreground mb-6">
            If you discover a security vulnerability, please report it to us immediately.
          </p>
          <a
            href="mailto:security@internationalcarcompanyinc.com"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Shield className="h-5 w-5" />
            Report Security Issue
          </a>
        </div>
      </div>
    </div>
  )
}
