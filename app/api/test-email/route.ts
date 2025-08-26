import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check environment variables
    const emailConfig = {
      emailService: process.env.EMAIL_SERVICE || process.env.EMAIL_PROVIDER || 'not set',
      resendApiKey: process.env.RESEND_API_KEY ? 'configured' : 'missing',
      emailApiKey: process.env.EMAIL_API_KEY ? 'configured' : 'missing',
      fromEmail: process.env.FROM_EMAIL || 'not set',
      nodeEnv: process.env.NODE_ENV || 'not set'
    }

    // Test email sending
    const testCode = '123456'
    const emailSent = await sendTestEmail(email, testCode)

    return NextResponse.json({
      success: true,
      message: 'Email configuration test completed',
      config: emailConfig,
      testResult: {
        email: email,
        code: testCode,
        sent: emailSent
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

async function sendTestEmail(email: string, code: string): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY
    if (!apiKey) {
      console.log('❌ No API key found for email service')
      return false
    }

    const fromEmail = process.env.FROM_EMAIL || 'info@internationalcarcompanyinc.com'
    
    console.log(`📧 Testing email service configuration:`)
    console.log(`📧 To: ${email}`)
    console.log(`📧 From: ${fromEmail}`)
    console.log(`📧 API Key: ${apiKey ? 'configured' : 'missing'}`)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: 'Test Email - International Car Company Inc',
        html: `<h1>Test Email</h1><p>Your test code is: <strong>${code}</strong></p>`,
        text: `Test Email - Your test code is: ${code}`
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Test email sent successfully:`, result)
      return true
    }

    const error = await response.text()
    console.error('❌ Test email failed:', response.status, error)
    return false

  } catch (error) {
    console.error('❌ Test email error:', error)
    return false
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
