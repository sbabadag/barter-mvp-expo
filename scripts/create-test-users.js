// CREATE REAL USERS FOR İMECE MARKETPLACE
// This script helps create users through Supabase Admin API

const { createClient } = require('@supabase/supabase-js');

// You need to get your Service Role Key from:
// Supabase Dashboard > Project Settings > API > service_role key (secret)
const supabaseUrl = 'https://guvdkdyrmmoyadmapokx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

if (supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.log('❌ HATA: Lütfen SUPABASE_SERVICE_ROLE_KEY environment variable\'ını ayarlayın');
  console.log('');
  console.log('1. Supabase Dashboard\'a gidin: https://supabase.com/dashboard');
  console.log('2. Projenizi seçin');
  console.log('3. Settings > API > service_role key\'i kopyalayın');
  console.log('4. Bu komutu çalıştırın:');
  console.log('   $env:SUPABASE_SERVICE_ROLE_KEY="your-service-key-here"; node create-test-users.js');
  console.log('');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'ahmet.yilmaz@email.com',
    password: 'AhmetImece123!',
    name: 'Ahmet Yılmaz',
    city: 'İstanbul'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'ayse.demir@email.com',
    password: 'AyseImece123!',
    name: 'Ayşe Demir',
    city: 'Ankara'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'mehmet.kaya@email.com',
    password: 'MehmetImece123!',
    name: 'Mehmet Kaya',
    city: 'İzmir'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'zeynep.ozkan@email.com',
    password: 'ZeynepImece123!',
    name: 'Zeynep Özkan',
    city: 'Bursa'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'can.sahin@email.com',
    password: 'CanImece123!',
    name: 'Can Şahin',
    city: 'Antalya'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'elif.arslan@email.com',
    password: 'ElifImece123!',
    name: 'Elif Arslan',
    city: 'Trabzon'
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    email: 'emre.yildiz@email.com',
    password: 'EmreImece123!',
    name: 'Emre Yıldız',
    city: 'Adana'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    email: 'selin.dogan@email.com',
    password: 'SelinImece123!',
    name: 'Selin Doğan',
    city: 'Gaziantep'
  }
];

async function createTestUsers() {
  console.log('🚀 İmece Marketplace test kullanıcıları oluşturuluyor...');
  console.log('');
  
  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.name,
          city: user.city
        }
      });

      if (authError) {
        console.error(`❌ ${user.name} kullanıcısı oluşturulamadı:`, authError.message);
        continue;
      }

      console.log(`✅ ${user.name} başarıyla oluşturuldu`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   🆔 User ID: ${authData.user.id}`);
      console.log('');

    } catch (error) {
      console.error(`❌ ${user.name} oluşturulurken hata:`, error.message);
    }
  }
  
  console.log('🎉 Kullanıcı oluşturma işlemi tamamlandı!');
  console.log('');
  console.log('� Sonraki adımlar:');
  console.log('1. Yukarıda görünen User ID\'leri not edin');
  console.log('2. populate_real_users_and_goods.sql dosyasındaki UUID\'leri bu ID\'lerle değiştirin');
  console.log('3. SQL dosyasını Supabase SQL Editor\'da çalıştırın');
}

// Run the script
if (require.main === module) {
  createTestUsers().catch(console.error);
}

module.exports = { createTestUsers, testUsers };
