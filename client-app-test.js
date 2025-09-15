/**
 * İMECE MARKETPLACE - CLIENT TESTING SCRIPT
 * ========================================
 * 
 * This script tests the İmece marketplace app from a client perspective,
 * simulating real user interactions and workflows.
 * 
 * USAGE:
 * 1. Set up environment variables (Supabase URL/keys)
 * 2. Run: node client-app-test.js
 * 3. Follow the interactive prompts or run automated tests
 * 
 * FEATURES TESTED:
 * - User authentication (signup/login)
 * - Profile management
 * - Listing creation and management
 * - Search and filtering
 * - Messaging system
 * - Offer/Bid system
 * - Rating system
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Console colors for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ClientAppTester {
  constructor() {
    this.currentUser = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    
    switch (type) {
      case 'success':
        console.log(`${colors.green}✅ ${prefix} ${message}${colors.reset}`);
        break;
      case 'error':
        console.log(`${colors.red}❌ ${prefix} ${message}${colors.reset}`);
        break;
      case 'warning':
        console.log(`${colors.yellow}⚠️  ${prefix} ${message}${colors.reset}`);
        break;
      case 'info':
        console.log(`${colors.blue}ℹ️  ${prefix} ${message}${colors.reset}`);
        break;
      case 'test':
        console.log(`${colors.cyan}🧪 ${prefix} ${message}${colors.reset}`);
        break;
      case 'header':
        console.log(`\n${colors.bold}${colors.magenta}🚀 ${message}${colors.reset}\n`);
        break;
    }
  }

  async recordTest(testName, result, details = '') {
    this.testResults.tests.push({
      name: testName,
      result,
      details,
      timestamp: new Date().toISOString()
    });
    
    if (result) {
      this.testResults.passed++;
      this.log(`${testName} - PASSED ${details}`, 'success');
    } else {
      this.testResults.failed++;
      this.log(`${testName} - FAILED ${details}`, 'error');
    }
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  // ====================
  // AUTHENTICATION TESTS
  // ====================

  async testUserRegistration() {
    this.log('Testing user registration flow...', 'test');
    
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      // Test user signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            display_name: 'Test User',
            first_name: 'Test',
            last_name: 'User',
            city: 'İstanbul',
            phone: '05551234567'
          }
        }
      });

      if (signUpError) {
        await this.recordTest('User Registration', false, signUpError.message);
        return false;
      }

      await this.recordTest('User Registration', true, `User created: ${testEmail}`);
      this.currentUser = signUpData.user;
      return true;

    } catch (error) {
      await this.recordTest('User Registration', false, error.message);
      return false;
    }
  }

  async testUserLogin() {
    this.log('Testing user login flow...', 'test');
    
    try {
      // Use one of the pre-created test users
      const testEmail = 'ahmet.yilmaz@email.com';
      const testPassword = 'AhmetImece123!';
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (error) {
        await this.recordTest('User Login', false, error.message);
        return false;
      }

      await this.recordTest('User Login', true, `Logged in as: ${data.user.email}`);
      this.currentUser = data.user;
      return true;

    } catch (error) {
      await this.recordTest('User Login', false, error.message);
      return false;
    }
  }

  async testProfileUpdate() {
    this.log('Testing profile update...', 'test');
    
    if (!this.currentUser) {
      await this.recordTest('Profile Update', false, 'No authenticated user');
      return false;
    }

    try {
      const updateData = {
        display_name: 'Updated Test User',
        city: 'Ankara',
        phone: '05559876543'
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', this.currentUser.id)
        .select();

      if (error) {
        await this.recordTest('Profile Update', false, error.message);
        return false;
      }

      await this.recordTest('Profile Update', true, 'Profile updated successfully');
      return true;

    } catch (error) {
      await this.recordTest('Profile Update', false, error.message);
      return false;
    }
  }

  // ====================
  // LISTING TESTS
  // ====================

  async testCreateListing() {
    this.log('Testing listing creation...', 'test');
    
    if (!this.currentUser) {
      await this.recordTest('Create Listing', false, 'No authenticated user');
      return false;
    }

    try {
      const listingData = {
        title: 'Test Laptop',
        description: 'Temiz kullanılmış laptop, hiçbir sorunu yok.',
        price: 2500,
        currency: 'TL',
        category: 'Electronics',
        location: 'İstanbul, Kadıköy',
        seller_id: this.currentUser.id,
        condition: 'İyi',
        is_active: true
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(listingData)
        .select();

      if (error) {
        await this.recordTest('Create Listing', false, error.message);
        return false;
      }

      await this.recordTest('Create Listing', true, `Listing created: ${data[0].title}`);
      return data[0];

    } catch (error) {
      await this.recordTest('Create Listing', false, error.message);
      return false;
    }
  }

  async testSearchListings() {
    this.log('Testing listing search functionality...', 'test');
    
    try {
      // Test category search
      const { data: electronicsData, error: electronicsError } = await supabase
        .from('listings')
        .select('*')
        .ilike('category', '%Electronics%')
        .eq('is_active', true)
        .limit(5);

      if (electronicsError) {
        await this.recordTest('Search Listings - Category', false, electronicsError.message);
      } else {
        await this.recordTest('Search Listings - Category', true, `Found ${electronicsData.length} electronics`);
      }

      // Test text search
      const { data: searchData, error: searchError } = await supabase
        .from('listings')
        .select('*')
        .or('title.ilike.%laptop%,description.ilike.%laptop%')
        .eq('is_active', true)
        .limit(5);

      if (searchError) {
        await this.recordTest('Search Listings - Text', false, searchError.message);
      } else {
        await this.recordTest('Search Listings - Text', true, `Found ${searchData.length} laptop results`);
      }

      return true;

    } catch (error) {
      await this.recordTest('Search Listings', false, error.message);
      return false;
    }
  }

  // ====================
  // MESSAGING TESTS
  // ====================

  async testSendMessage() {
    this.log('Testing messaging system...', 'test');
    
    if (!this.currentUser) {
      await this.recordTest('Send Message', false, 'No authenticated user');
      return false;
    }

    try {
      // Get another user to send message to
      const { data: otherUsers } = await supabase
        .from('profiles')
        .select('id, display_name')
        .neq('id', this.currentUser.id)
        .limit(1);

      if (!otherUsers || otherUsers.length === 0) {
        await this.recordTest('Send Message', false, 'No other users found');
        return false;
      }

      const messageData = {
        sender_id: this.currentUser.id,
        receiver_id: otherUsers[0].id,
        content: 'Merhaba! Bu bir test mesajıdır.',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();

      if (error) {
        await this.recordTest('Send Message', false, error.message);
        return false;
      }

      await this.recordTest('Send Message', true, `Message sent to ${otherUsers[0].display_name}`);
      return true;

    } catch (error) {
      await this.recordTest('Send Message', false, error.message);
      return false;
    }
  }

  async testGetMessages() {
    this.log('Testing message retrieval...', 'test');
    
    if (!this.currentUser) {
      await this.recordTest('Get Messages', false, 'No authenticated user');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(display_name),
          receiver:receiver_id(display_name)
        `)
        .or(`sender_id.eq.${this.currentUser.id},receiver_id.eq.${this.currentUser.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        await this.recordTest('Get Messages', false, error.message);
        return false;
      }

      await this.recordTest('Get Messages', true, `Retrieved ${data.length} messages`);
      return true;

    } catch (error) {
      await this.recordTest('Get Messages', false, error.message);
      return false;
    }
  }

  // ====================
  // OFFER/BID TESTS
  // ====================

  async testCreateOffer() {
    this.log('Testing offer creation...', 'test');
    
    if (!this.currentUser) {
      await this.recordTest('Create Offer', false, 'No authenticated user');
      return false;
    }

    try {
      // Get a listing to make an offer on
      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .neq('seller_id', this.currentUser.id)
        .eq('is_active', true)
        .limit(1);

      if (!listings || listings.length === 0) {
        await this.recordTest('Create Offer', false, 'No suitable listings found');
        return false;
      }

      const offerData = {
        listing_id: listings[0].id,
        bidder_id: this.currentUser.id,
        amount: Math.floor(listings[0].price * 0.8), // Offer 80% of asking price
        message: 'Bu fiyata satmaya ne dersiniz?',
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('offers')
        .insert(offerData)
        .select();

      if (error) {
        await this.recordTest('Create Offer', false, error.message);
        return false;
      }

      await this.recordTest('Create Offer', true, `Offer created for ${listings[0].title}`);
      return true;

    } catch (error) {
      await this.recordTest('Create Offer', false, error.message);
      return false;
    }
  }

  // ====================
  // RATING TESTS
  // ====================

  async testRatingSystem() {
    this.log('Testing rating system...', 'test');
    
    if (!this.currentUser) {
      await this.recordTest('Rating System', false, 'No authenticated user');
      return false;
    }

    try {
      // Get another user to rate
      const { data: otherUsers } = await supabase
        .from('profiles')
        .select('id, display_name')
        .neq('id', this.currentUser.id)
        .limit(1);

      if (!otherUsers || otherUsers.length === 0) {
        await this.recordTest('Rating System', false, 'No other users found');
        return false;
      }

      const ratingData = {
        rater_id: this.currentUser.id,
        rated_user_id: otherUsers[0].id,
        rating: 5,
        comment: 'Çok güvenilir satıcı, hızlı teslimat!',
        transaction_type: 'purchase'
      };

      const { data, error } = await supabase
        .from('ratings')
        .insert(ratingData)
        .select();

      if (error) {
        await this.recordTest('Rating System', false, error.message);
        return false;
      }

      await this.recordTest('Rating System', true, `Rating given to ${otherUsers[0].display_name}`);
      return true;

    } catch (error) {
      await this.recordTest('Rating System', false, error.message);
      return false;
    }
  }

  // ====================
  // DATABASE STRUCTURE TESTS
  // ====================

  async testDatabaseStructure() {
    this.log('Testing database structure and connectivity...', 'test');
    
    const tables = ['profiles', 'listings', 'messages', 'offers', 'ratings'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          await this.recordTest(`Database - ${table} table`, false, error.message);
        } else {
          await this.recordTest(`Database - ${table} table`, true, 'Accessible');
        }
      } catch (error) {
        await this.recordTest(`Database - ${table} table`, false, error.message);
      }
    }
  }

  // ====================
  // MAIN TEST RUNNER
  // ====================

  async runAutomatedTests() {
    this.log('İMECE MARKETPLACE - CLIENT TESTING STARTED', 'header');
    
    // Database structure tests
    await this.testDatabaseStructure();
    
    // Authentication tests
    await this.testUserLogin();
    
    if (this.currentUser) {
      // Core functionality tests
      await this.testProfileUpdate();
      await this.testCreateListing();
      await this.testSearchListings();
      await this.testSendMessage();
      await this.testGetMessages();
      await this.testCreateOffer();
      await this.testRatingSystem();
    }
    
    this.displayResults();
  }

  async runInteractiveTests() {
    this.log('İMECE MARKETPLACE - INTERACTIVE CLIENT TESTING', 'header');
    
    while (true) {
      console.log('\n📋 Test Menu:');
      console.log('1. Test User Login');
      console.log('2. Test User Registration');
      console.log('3. Test Create Listing');
      console.log('4. Test Search Listings');
      console.log('5. Test Send Message');
      console.log('6. Test Create Offer');
      console.log('7. Test Rating System');
      console.log('8. Run All Tests');
      console.log('9. Show Test Results');
      console.log('0. Exit');
      
      const choice = await this.question('\nSelect an option (0-9): ');
      
      switch (choice) {
        case '1':
          await this.testUserLogin();
          break;
        case '2':
          await this.testUserRegistration();
          break;
        case '3':
          await this.testCreateListing();
          break;
        case '4':
          await this.testSearchListings();
          break;
        case '5':
          await this.testSendMessage();
          break;
        case '6':
          await this.testCreateOffer();
          break;
        case '7':
          await this.testRatingSystem();
          break;
        case '8':
          await this.runAutomatedTests();
          break;
        case '9':
          this.displayResults();
          break;
        case '0':
          this.log('Testing session ended.', 'info');
          this.rl.close();
          return;
        default:
          this.log('Invalid option, please try again.', 'warning');
      }
    }
  }

  displayResults() {
    console.log('\n' + '='.repeat(50));
    this.log('TEST RESULTS SUMMARY', 'header');
    
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`Total Tests: ${total}`);
    console.log(`${colors.green}Passed: ${this.testResults.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.testResults.failed}${colors.reset}`);
    console.log(`Success Rate: ${successRate}%\n`);
    
    if (this.testResults.tests.length > 0) {
      console.log('Detailed Results:');
      console.log('-'.repeat(30));
      
      this.testResults.tests.forEach((test, index) => {
        const status = test.result ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
        console.log(`${index + 1}. ${test.name}: ${status}`);
        if (test.details) {
          console.log(`   ${colors.yellow}${test.details}${colors.reset}`);
        }
      });
    }
    
    console.log('='.repeat(50));
  }

  async cleanup() {
    // Sign out current user
    if (this.currentUser) {
      await supabase.auth.signOut();
    }
    this.rl.close();
  }
}

// Main execution
async function main() {
  const tester = new ClientAppTester();
  
  console.log(`${colors.bold}${colors.magenta}
  ╔══════════════════════════════════════════════════════╗
  ║              İMECE MARKETPLACE                       ║
  ║              CLIENT APP TESTER                       ║
  ║                                                      ║
  ║  Comprehensive testing tool for client-side         ║
  ║  functionality and user workflows                    ║
  ╚══════════════════════════════════════════════════════╝
  ${colors.reset}`);

  try {
    const mode = await tester.question('\nSelect testing mode:\n1. Automated Tests\n2. Interactive Tests\nChoice (1 or 2): ');
    
    if (mode === '1') {
      await tester.runAutomatedTests();
    } else if (mode === '2') {
      await tester.runInteractiveTests();
    } else {
      tester.log('Invalid selection. Running automated tests...', 'warning');
      await tester.runAutomatedTests();
    }
    
  } catch (error) {
    tester.log(`Testing failed: ${error.message}`, 'error');
  } finally {
    await tester.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ClientAppTester;
