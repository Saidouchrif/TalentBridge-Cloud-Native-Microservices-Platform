// Script de diagnostic pour PostgreSQL
console.log("=== DIAGNOSTIC POSTGRESQL ===");

async function diagnosePostgreSQL() {
  try {
    console.log("1. Test de configuration...");
    require("dotenv").config();
    
    console.log("Variables d'environnement:");
    console.log(`  DB_HOST: ${process.env.DB_HOST}`);
    console.log(`  DB_PORT: ${process.env.DB_PORT}`);
    console.log(`  DB_NAME: ${process.env.DB_NAME}`);
    console.log(`  DB_DIALECT: ${process.env.DB_DIALECT}`);
    
    console.log("\n2. Test de connexion...");
    const { Sequelize } = require("sequelize");
    
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || "postgres",
        logging: true
      }
    );
    
    await sequelize.authenticate();
    console.log("   ✓ Connexion réussie!");
    
    console.log("\n3. Test de création de table...");
    await sequelize.getQueryInterface().createTable('test_table', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING
      }
    });
    console.log("   ✓ Table créée avec succès!");
    
    console.log("\n4. Nettoyage...");
    await sequelize.getQueryInterface().dropTable('test_table');
    console.log("   ✓ Table supprimée!");
    
    console.log("\n=== SUCCÈS - PostgreSQL fonctionne! ===");
    
  } catch (error) {
    console.error("\n=== ERREUR ===");
    console.error("Message:", error.message);
    console.error("Code:", error.original?.code);
    console.error("Stack:", error.stack);
    
    console.log("\n=== SOLUTIONS POSSIBLES ===");
    console.log("1. Vérifiez que PostgreSQL est installé et démarré");
    console.log("2. Vérifiez les identifiants dans .env");
    console.log("3. Essayez avec SQLite (temporaire):");
    console.log("   DB_DIALECT=sqlite");
    console.log("   SQLITE_STORAGE=./database.sqlite");
  } finally {
    try {
      if (sequelize) await sequelize.close();
    } catch (e) {}
  }
}

diagnosePostgreSQL();
