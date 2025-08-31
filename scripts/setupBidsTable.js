const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read Supabase config
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'placeholder_url';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

console.log('Creating Supabase client...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (supabaseUrl === 'placeholder_url' || supabaseKey === 'placeholder_key') {
  console.log('⚠️  Using placeholder Supabase config. Database operations will be mocked.');
  console.log('To use real database, set environment variables:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBidsTable() {
  try {
    console.log('Setting up bids table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', 'setup_bids_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL...');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_text: statement });
        
        if (error && !error.message.includes('already exists')) {
          console.error(`Error in statement ${i + 1}:`, error);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('✅ Bids table setup completed!');
    
    // Test the table by checking its structure
    console.log('Testing bids table...');
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error testing bids table:', error);
    } else {
      console.log('✅ Bids table is accessible!');
    }
    
  } catch (error) {
    console.error('❌ Error setting up bids table:', error);
  }
}

// Alternative: Try using basic table creation
async function createBidsTableSimple() {
  try {
    console.log('Creating bids table with simple approach...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql_text: `
        create table if not exists bids (
          id uuid primary key default uuid_generate_v4(),
          listing_id uuid not null,
          bidder_id uuid not null,
          amount numeric not null check (amount > 0),
          message text,
          status text not null default 'pending',
          created_at timestamp with time zone default now(),
          expires_at timestamp with time zone,
          counter_offer_amount numeric,
          counter_offer_message text
        );
      `
    });
    
    if (error) {
      console.error('❌ Error creating bids table:', error);
      
      // Try alternative approach without RPC
      console.log('Trying alternative approach...');
      const { error: error2 } = await supabase
        .from('_supabase_migrations')
        .select('*')
        .limit(1);
      
      if (error2) {
        console.log('RPC functions may not be available. Please run the SQL manually in Supabase Dashboard.');
        console.log('SQL to run:');
        console.log('---');
        const sqlPath = path.join(__dirname, '..', 'sql', 'setup_bids_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(sql);
        console.log('---');
      }
    } else {
      console.log('✅ Bids table created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🚀 Setting up bids table...');
  
  // Try simple approach first
  await createBidsTableSimple();
  
  console.log('\n📋 Manual Setup Instructions:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Open SQL Editor');
  console.log('3. Copy and paste the SQL from sql/setup_bids_table.sql');
  console.log('4. Run the SQL script');
  console.log('5. Restart your Expo app');
}

main().catch(console.error);
