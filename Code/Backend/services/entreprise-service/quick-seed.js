// Script de test pour vérifier la connexion et insérer des données
console.log("=== TEST DE CONNEXION ET INSERTION ===");

async function testAndSeed() {
  try {
    console.log("1. Test de connexion à la base...");
    require("dotenv").config();
    const { sequelize } = require("./src/Models");
    
    await sequelize.authenticate();
    console.log("   ✓ Connexion réussie");
    
    console.log("2. Synchronisation...");
    await sequelize.sync({ force: true });
    console.log("   ✓ Base synchronisée");
    
    console.log("3. Insertion des données...");
    const Enterprise = require("./src/Models/Enterprise");
    
    const enterprise = await Enterprise.create({
      ownerUserId: 1,
      name: "TechCorp Solutions",
      sector: "Informatique",
      description: "Entreprise de développement logiciel",
      addressLine1: "123 Avenue de la Technologie",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      phone: "+33 1 23 45 67 89",
      website: "https://techcorp.fr"
    });
    
    console.log(`   ✓ Entreprise créée: ${enterprise.name} (ID: ${enterprise.id})`);
    
    console.log("4. Vérification...");
    const enterprises = await Enterprise.findAll();
    console.log(`   ✓ Total entreprises en base: ${enterprises.length}`);
    
    console.log("\n=== SUCCÈS - Données insérées! ===");
    console.log("Testez maintenant: http://localhost:5002/api/entreprises");
    
  } catch (error) {
    console.error("ERREUR:", error.message);
    console.error("STACK:", error.stack);
  } finally {
    try {
      const { sequelize } = require("./src/Models");
      await sequelize.close();
    } catch (e) {}
  }
}

testAndSeed();
