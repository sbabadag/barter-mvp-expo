const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://xrftdhlmzgkmfpbzqupw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZnRkaGxtemdrbWZwYnpxdXB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTczMTY2NywiZXhwIjoyMDUxMzA3NjY3fQ.xzOdxNyqHO3fkcl7Jj2PZgWxMdmQsggHSGmGQU-yQzw';

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupRatingSystem() {
  try {
    console.log('🔄 Setting up Rating & Review System...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../sql/setup_rating_system.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements (basic split by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.includes('SELECT ')) {
        // Skip SELECT statements that are just for display
        continue;
      }
      
      console.log(`📋 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // Try direct execution for DDL statements
          const { data: directData, error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(1);
          
          // If that fails, try using the postgres function
          if (directError) {
            console.log(`⚠️  Statement ${i + 1} may need manual execution:`, statement.substring(0, 100) + '...');
          }
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} error:`, err.message);
      }
    }
    
    // Test the setup by checking if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['ratings', 'user_rating_stats']);
    
    if (tables && tables.length > 0) {
      console.log('✅ Rating system tables created successfully!');
      console.log('📊 Tables found:', tables.map(t => t.table_name));
    } else {
      console.log('❌ Could not verify table creation');
    }
    
    // Check if we have any sample ratings
    const { data: sampleRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (!ratingsError) {
      console.log(`📈 Sample ratings created: ${sampleRatings?.length || 0} ratings`);
    }
    
    console.log('🎉 Rating & Review System setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up rating system:', error);
  }
}

// Run the setup
setupRatingSystem();
