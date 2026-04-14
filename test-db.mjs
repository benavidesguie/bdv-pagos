import pg from 'pg';

const { Client } = pg;

async function testConnection() {
  const client = new Client({
    host: 'danube.services',
    port: 5434,
    database: 'whatsapp-venta',
    user: 'n8n_user',
    password: 'Danube.01',
    connectTimeout: 10000
  });

  try {
    console.log('🔄 Conectando a PostgreSQL (whatsapp-venta)...');
    await client.connect();
    console.log('✅ Conexión exitosa!');

    console.log('\n📋 Verificando tablas...');
    const result = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema IN ('public', 'marketplace')
      ORDER BY table_schema, table_name
    `);

    console.log('Tablas encontradas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_schema}.${row.table_name}`);
    });

    // Check if orders table exists in marketplace schema
    const ordersCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'marketplace' AND table_name = 'orders'
      ORDER BY ordinal_position
    `);

    if (ordersCheck.rows.length > 0) {
      console.log('\n📦 Tabla "marketplace.orders" encontrada:');
      ordersCheck.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('\n⚠️  Tabla "marketplace.orders" NO encontrada');
    }

    // Check customers table
    const customersCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'marketplace' AND table_name = 'customers'
      ORDER BY ordinal_position
    `);

    if (customersCheck.rows.length > 0) {
      console.log('\n👥 Tabla "marketplace.customers" encontrada:');
      customersCheck.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('\n⚠️  Tabla "marketplace.customers" NO encontrada');
    }

    await client.end();
    console.log('\n✅ Test completado!');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();
