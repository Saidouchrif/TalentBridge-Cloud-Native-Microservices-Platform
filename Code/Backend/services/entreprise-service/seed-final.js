// Script de seed simplifié pour test direct
console.log("=== SCRIPT DE SEED POUR ENTREPRISE-SERVICE ===");

async function runSeed() {
  try {
    // Charger les dépendances
    console.log("1. Chargement des dépendances...");
    require("dotenv").config();
    
    console.log("2. Chargement des modèles...");
    const { sequelize } = require("./src/Models");
    const Enterprise = require("./src/Models/Enterprise");
    const Offer = require("./src/Models/Offer");
    const Application = require("./src/Models/Application");

    console.log("3. Connexion à la base de données...");
    await sequelize.authenticate();
    console.log("   ✓ Connexion réussie");

    console.log("4. Synchronisation de la base...");
    await sequelize.sync({ force: true });
    console.log("   ✓ Base synchronisée");

    console.log("5. Insertion des entreprises...");
    const enterprises = await Enterprise.bulkCreate([
      {
        ownerUserId: 1,
        name: "TechCorp Solutions",
        sector: "Informatique",
        description: "Entreprise spécialisée dans le développement de solutions logicielles",
        addressLine1: "123 Avenue de la Technologie",
        city: "Paris",
        postalCode: "75001",
        country: "France",
        phone: "+33 1 23 45 67 89",
        website: "https://techcorp.fr"
      },
      {
        ownerUserId: 2,
        name: "Digital Marketing Pro",
        sector: "Marketing",
        description: "Agence de marketing digital",
        addressLine1: "45 Rue du Commerce",
        city: "Lyon",
        postalCode: "69000",
        country: "France",
        phone: "+33 4 56 78 90 12",
        website: "https://digitalmp.fr"
      },
      {
        ownerUserId: 3,
        name: "HealthCare Plus",
        sector: "Santé",
        description: "Technologies de santé",
        addressLine1: "78 Boulevard de la Santé",
        city: "Marseille",
        postalCode: "13000",
        country: "France",
        phone: "+33 4 91 23 45 67",
        website: "https://healthcareplus.fr"
      }
    ]);
    console.log(`   ✓ ${enterprises.length} entreprises insérées`);

    console.log("6. Insertion des offres...");
    const offers = await Offer.bulkCreate([
      {
        enterpriseId: 1,
        title: "Développeur Web Full Stack",
        description: "Recherche développeur expérimenté",
        requiredSkills: ["JavaScript", "React", "Node.js"],
        location: "Paris",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 1,
        title: "Data Scientist Junior",
        description: "Stage en analyse de données",
        requiredSkills: ["Python", "Machine Learning"],
        location: "Paris",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 2,
        title: "Community Manager",
        description: "Gestion des réseaux sociaux",
        requiredSkills: ["Social Media", "Content Creation"],
        location: "Lyon",
        status: "published",
        publishedAt: new Date()
      }
    ]);
    console.log(`   ✓ ${offers.length} offres insérées`);

    console.log("7. Insertion des candidatures...");
    const applications = await Application.bulkCreate([
      {
        offerId: 1,
        studentUserId: 101,
        status: "pending"
      },
      {
        offerId: 1,
        studentUserId: 102,
        status: "accepted"
      },
      {
        offerId: 2,
        studentUserId: 103,
        status: "pending"
      }
    ]);
    console.log(`   ✓ ${applications.length} candidatures insérées`);

    console.log("\n=== SUCCÈS ===");
    console.log(`Entreprises: ${enterprises.length}`);
    console.log(`Offres: ${offers.length}`);
    console.log(`Candidatures: ${applications.length}`);
    console.log("\nDonnées prêtes pour les tests!");

  } catch (error) {
    console.error("\n=== ERREUR ===");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    try {
      const { sequelize } = require("./src/Models");
      await sequelize.close();
      console.log("\nConnexion fermée.");
    } catch (e) {
      // Ignorer les erreurs de fermeture
    }
  }
}

// Exécuter immédiatement
runSeed();
