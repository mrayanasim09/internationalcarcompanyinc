#!/usr/bin/env node

/**
 * Test script for login-resend endpoint
 * This helps diagnose the 500 Internal Server Error
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'https://internationalcarcompanyinc.com';
const EMAIL = process.env.TEST_EMAIL || 'admin@example.com';

async function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
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

async function testEndpoints() {
  console.log('🔍 Testing login-resend endpoint and related services...\n');

  try {
    // 1. Test health endpoints
    console.log('1️⃣ Testing health endpoints...');
    
    const healthEndpoints = [
      '/api/health/supabase',
      '/api/health/redis',
      '/api/csrf-debug'
    ];

    for (const endpoint of healthEndpoints) {
      try {
        const result = await makeRequest(`${BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Test-Script/1.0'
          }
        });
        
        console.log(`   ${endpoint}: ${result.status} ${result.status === 200 ? '✅' : '❌'}`);
        if (result.status !== 200) {
          console.log(`      Response:`, JSON.stringify(result.data, null, 2));
        }
      } catch (error) {
        console.log(`   ${endpoint}: ❌ Error: ${error.message}`);
      }
    }

    // 2. Get CSRF token
    console.log('\n2️⃣ Getting CSRF token...');
    
    const csrfResult = await makeRequest(`${BASE_URL}/api/csrf-debug`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script/1.0'
      }
    });

    if (csrfResult.status !== 200) {
      console.log('   ❌ Failed to get CSRF token');
      return;
    }

    const csrfToken = csrfResult.data.token;
    console.log(`   ✅ CSRF token obtained: ${csrfToken.substring(0, 20)}...`);

    // 3. Test login-resend with debug endpoint
    console.log('\n3️⃣ Testing login-resend debug endpoint...');
    
    const debugResult = await makeRequest(`${BASE_URL}/api/admin/login-resend-debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'User-Agent': 'Test-Script/1.0'
      },
      body: JSON.stringify({ email: EMAIL })
    });

    console.log(`   Debug endpoint status: ${debugResult.status} ${debugResult.status === 200 ? '✅' : '❌'}`);
    
    if (debugResult.status === 200) {
      const summary = debugResult.data.summary;
      console.log('   📊 Summary:');
      console.log(`      - Environment configured: ${summary.environmentConfigured ? '✅' : '❌'}`);
      console.log(`      - CSRF working: ${summary.csrfWorking ? '✅' : '❌'}`);
      console.log(`      - Supabase working: ${summary.supabaseWorking ? '✅' : '❌'}`);
      console.log(`      - Error count: ${summary.errorCount}`);
      
      if (summary.errorCount > 0) {
        console.log('   🚨 Errors found:');
        debugResult.data.debug.errors.forEach((error, index) => {
          console.log(`      ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log('   Response:', JSON.stringify(debugResult.data, null, 2));
    }

    // 4. Test actual login-resend endpoint
    console.log('\n4️⃣ Testing actual login-resend endpoint...');
    
    const loginResendResult = await makeRequest(`${BASE_URL}/api/admin/login-resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'User-Agent': 'Test-Script/1.0'
      },
      body: JSON.stringify({ email: EMAIL })
    });

    console.log(`   Login-resend status: ${loginResendResult.status} ${loginResendResult.status === 200 ? '✅' : '❌'}`);
    
    if (loginResendResult.status !== 200) {
      console.log('   Response:', JSON.stringify(loginResendResult.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testEndpoints().then(() => {
  console.log('\n🏁 Testing complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test script crashed:', error);
  process.exit(1);
});
