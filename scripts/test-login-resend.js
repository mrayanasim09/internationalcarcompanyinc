#!/usr/bin/env node

/**
 * Test script for debugging login-resend endpoint
 * Usage: node scripts/test-login-resend.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'https://internationalcarcompanyinc.com';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@example.com';

async function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCSRFToken() {
  console.log('🔐 Testing CSRF token generation...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/csrf-debug`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('CSRF Response:', {
      status: response.status,
      success: response.data.success,
      hasToken: !!response.data.token
    });

    return response.data.token;
  } catch (error) {
    console.error('❌ CSRF token test failed:', error.message);
    return null;
  }
}

async function testLoginResend(csrfToken) {
  console.log('\n📧 Testing login-resend endpoint...');
  
  if (!csrfToken) {
    console.error('❌ No CSRF token available');
    return;
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/login-resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'Cookie': `csrf_token=${csrfToken}`
      },
      body: JSON.stringify({
        email: TEST_EMAIL
      })
    });

    console.log('Login-resend Response:', {
      status: response.status,
      success: response.data.success,
      error: response.data.error,
      message: response.data.message
    });

    if (response.status === 500) {
      console.error('❌ 500 Internal Server Error detected');
      console.error('Response data:', response.data);
    } else if (response.status === 200) {
      console.log('✅ Login-resend endpoint working correctly');
    }

  } catch (error) {
    console.error('❌ Login-resend test failed:', error.message);
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔧 Checking environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'SESSION_SECRET',
    'ENCRYPTION_KEY'
  ];

  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: ${varName.includes('KEY') || varName.includes('SECRET') ? '***SET***' : process.env[varName]}`);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
  } else {
    console.log('✅ All required environment variables are set');
  }
}

async function main() {
  console.log('🚀 Starting login-resend endpoint test...\n');
  
  await testEnvironmentVariables();
  const csrfToken = await testCSRFToken();
  await testLoginResend(csrfToken);
  
  console.log('\n✨ Test completed');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testCSRFToken, testLoginResend, testEnvironmentVariables };
