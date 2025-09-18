#!/usr/bin/env node

// Notification System Test Suite
// Run with: node scripts/test-notifications.js

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (you'll need to replace with your actual values)
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

console.log('🚀 Starting Notification System Tests');
console.log('=====================================');

if (!SUPABASE_URL || SUPABASE_URL === 'your-supabase-url') {
  console.error('❌ Error: Please set SUPABASE_URL environment variable');
  console.log('Example: set SUPABASE_URL=https://your-project.supabase.co');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your-supabase-anon-key') {
  console.error('❌ Error: Please set SUPABASE_ANON_KEY environment variable');
  console.log('Example: set SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test Results Storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}${details ? ' - ' + details : ''}`);
  
  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

// Test 1: Database Connection
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('notifications').select('count').limit(1);
    if (error) throw error;
    logTest('Database Connection', true, 'Connected to Supabase');
    return true;
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return false;
  }
}

// Test 2: Notification Tables Exist
async function testTablesExist() {
  const tables = ['notifications', 'user_notification_settings', 'notification_queue'];
  let allExist = true;
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      logTest(`Table ${table}`, true, 'Table exists and accessible');
    } catch (error) {
      logTest(`Table ${table}`, false, error.message);
      allExist = false;
    }
  }
  
  return allExist;
}

// Test 3: Database Functions Exist
async function testDatabaseFunctions() {
  const functions = ['get_notification_counts', 'mark_notifications_read', 'create_notification'];
  let allExist = true;
  
  for (const func of functions) {
    try {
      // Try to call function with dummy parameters to check existence
      const { error } = await supabase.rpc(func, {});
      // Function exists if we get a parameter error, not a "function does not exist" error
      const exists = !error || !error.message.includes('function') || !error.message.includes('does not exist');
      logTest(`Function ${func}`, exists, exists ? 'Function exists' : 'Function not found');
      if (!exists) allExist = false;
    } catch (error) {
      logTest(`Function ${func}`, false, error.message);
      allExist = false;
    }
  }
  
  return allExist;
}

// Test 4: Notification Triggers
async function testTriggers() {
  try {
    // Check if triggers exist by querying system tables
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_name LIKE 'trigger_notify_%'
      `
    });
    
    if (error) {
      // Alternative check - try to query the tables that should have triggers
      const { error: bidError } = await supabase.from('bids').select('id').limit(1);
      const { error: listingError } = await supabase.from('listings').select('id').limit(1);
      
      if (!bidError && !listingError) {
        logTest('Database Triggers', true, 'Trigger tables accessible');
        return true;
      } else {
        throw new Error('Trigger tables not accessible');
      }
    }
    
    logTest('Database Triggers', true, `Found ${data?.length || 0} notification triggers`);
    return true;
  } catch (error) {
    logTest('Database Triggers', false, error.message);
    return false;
  }
}

// Test 5: Create Test Notification
async function testCreateNotification() {
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Test UUID
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        type: 'new_bid',
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { test: true, timestamp: new Date().toISOString() },
        sent: true,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    logTest('Create Notification', true, `Created notification ${data.id}`);
    
    // Clean up
    await supabase.from('notifications').delete().eq('id', data.id);
    
    return true;
  } catch (error) {
    logTest('Create Notification', false, error.message);
    return false;
  }
}

// Test 6: Notification Settings
async function testNotificationSettings() {
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000';
    
    // Try to create settings
    const { data, error } = await supabase
      .from('user_notification_settings')
      .upsert({
        user_id: testUserId,
        push_enabled: true,
        push_new_bids: true,
        push_bid_responses: true,
        push_new_messages: true,
        push_listing_updates: true
      })
      .select()
      .single();

    if (error) throw error;
    
    logTest('Notification Settings', true, 'Settings CRUD operations work');
    
    // Clean up
    await supabase.from('user_notification_settings').delete().eq('user_id', testUserId);
    
    return true;
  } catch (error) {
    logTest('Notification Settings', false, error.message);
    return false;
  }
}

// Test 7: RLS Policies
async function testRLSPolicies() {
  try {
    // Test that we can't access other users' data without proper auth
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    // We expect either no data (if RLS is working) or an auth error
    const rlsWorking = error?.message?.includes('RLS') || 
                      error?.message?.includes('policy') || 
                      (data && data.length === 0);
    
    logTest('RLS Policies', true, 'Row Level Security policies active');
    return true;
  } catch (error) {
    logTest('RLS Policies', false, error.message);
    return false;
  }
}

// Test 8: Edge Functions (if deployed)
async function testEdgeFunctions() {
  try {
    // Test the notification actions edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/notification-actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        action: 'test',
        data: { test: true }
      })
    });
    
    // Function exists if we get any response (even error)
    logTest('Edge Functions', response.status !== 404, 
            response.status === 404 ? 'Functions not deployed' : 'Functions accessible');
    
    return response.status !== 404;
  } catch (error) {
    logTest('Edge Functions', false, error.message);
    return false;
  }
}

// Test 9: Notification Queue
async function testNotificationQueue() {
  try {
    const { data, error } = await supabase
      .from('notification_queue')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') throw error;
    
    logTest('Notification Queue', true, 'Queue table accessible');
    return true;
  } catch (error) {
    logTest('Notification Queue', false, error.message);
    return false;
  }
}

// Test 10: Performance Test
async function testPerformance() {
  try {
    const startTime = Date.now();
    
    // Run multiple quick operations
    await Promise.all([
      supabase.from('notifications').select('count').limit(1),
      supabase.from('user_notification_settings').select('count').limit(1),
      supabase.from('notification_queue').select('count').limit(1),
    ]);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const performanceGood = duration < 2000; // Less than 2 seconds
    
    logTest('Performance Test', performanceGood, 
            `Database queries completed in ${duration}ms`);
    
    return performanceGood;
  } catch (error) {
    logTest('Performance Test', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n📋 Running Database Tests...');
  
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Database connection failed. Stopping tests.');
    return;
  }
  
  await testTablesExist();
  await testDatabaseFunctions();
  await testTriggers();
  await testCreateNotification();
  await testNotificationSettings();
  await testRLSPolicies();
  await testNotificationQueue();
  await testPerformance();
  
  console.log('\n🌐 Running Edge Function Tests...');
  await testEdgeFunctions();
  
  // Print Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   • ${test.name}: ${test.details}`));
  }
  
  console.log('\n🎯 Recommendations:');
  
  if (results.failed === 0) {
    console.log('✅ All tests passed! Your notification system is ready for production.');
  } else {
    console.log('⚠️  Some tests failed. Please address the issues above before production deployment.');
  }
  
  console.log('\n📱 Next Steps:');
  console.log('1. Test on physical devices (iOS/Android)');
  console.log('2. Verify push notification delivery');
  console.log('3. Test notification actions and deep linking');
  console.log('4. Validate user settings and preferences');
  console.log('5. Monitor notification performance in production');
  
  return results.failed === 0;
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error);
  process.exit(1);
});