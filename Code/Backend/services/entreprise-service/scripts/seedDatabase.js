// Script de seed pour insérer des données de test dans l'entreprise-service
require("dotenv").config();
const { sequelize } = require("../src/Models");
const Enterprise = require("../src/Models/Enterprise");
const Offer = require("../src/Models/Offer");
const Application = require("../src/Models/Application");

async function seedDatabase() {
  try {
    console.log("Connexion à la base de données...");
    await sequelize.authenticate();
    console.log("Connexion réussie.");

    console.log("Synchronisation de la base de données...");
    await sequelize.sync({ force: true });
    console.log("Base de données synchronisée.");

    // Données de test pour les entreprises
    const enterprisesData = [
      {
        ownerUserId: 1,
        name: "TechCorp Solutions",
        sector: "Informatique",
        description: "Entreprise spécialisée dans le développement de solutions logicielles innovantes",
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
        description: "Agence de marketing digital et de communication",
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
        description: "Technologies de santé et solutions médicales avancées",
        addressLine1: "78 Boulevard de la Santé",
        city: "Marseille",
        postalCode: "13000",
        country: "France",
        phone: "+33 4 91 23 45 67",
        website: "https://healthcareplus.fr"
      },
      {
        ownerUserId: 4,
        name: "Green Energy Corp",
        sector: "Énergie",
        description: "Solutions d'énergie renouvelable et durable",
        addressLine1: "12 Avenue des Énergies",
        city: "Bordeaux",
        postalCode: "33000",
        country: "France",
        phone: "+33 5 56 78 90 12",
        website: "https://greenenergy.fr"
      },
      {
        ownerUserId: 5,
        name: "Finance Innovation",
        sector: "Finance",
        description: "Fintech et solutions financières innovantes",
        addressLine1: "89 Rue de la Bourse",
        city: "Paris",
        postalCode: "75002",
        country: "France",
        phone: "+33 1 45 67 89 01",
        website: "https://financeinnovation.fr"
      },
      {
        ownerUserId: 6,
        name: "Education First",
        sector: "Éducation",
        description: "Plateforme d'apprentissage en ligne et solutions éducatives",
        addressLine1: "34 Avenue de l'Éducation",
        city: "Lille",
        postalCode: "59000",
        country: "France",
        phone: "+33 3 20 12 34 56",
        website: "https://educationfirst.fr"
      },
      {
        ownerUserId: 7,
        name: "Transport Logistique 2000",
        sector: "Transport",
        description: "Solutions de transport et logistique intégrées",
        addressLine1: "56 Rue de la Logistique",
        city: "Toulouse",
        postalCode: "31000",
        country: "France",
        phone: "+33 5 61 23 45 67",
        website: "https://transportlogistique.fr"
      },
      {
        ownerUserId: 8,
        name: "Retail Solutions",
        sector: "Commerce",
        description: "Solutions de commerce et de vente au détail",
        addressLine1: "90 Avenue du Shopping",
        city: "Nice",
        postalCode: "06000",
        country: "France",
        phone: "+33 4 93 45 67 89",
        website: "https://retailsolutions.fr"
      },
      {
        ownerUserId: 9,
        name: "Media Productions",
        sector: "Média",
        description: "Production de contenu média et audiovisuel",
        addressLine1: "23 Rue du Cinéma",
        city: "Cannes",
        postalCode: "06400",
        country: "France",
        phone: "+33 4 92 12 34 56",
        website: "https://mediaproductions.fr"
      },
      {
        ownerUserId: 10,
        name: "AgroTech Industries",
        sector: "Agriculture",
        description: "Technologies agricoles et solutions agro-industrielles",
        addressLine1: "67 Route de l'Agriculture",
        city: "Rennes",
        postalCode: "35000",
        country: "France",
        phone: "+33 2 99 45 67 89",
        website: "https://agrotech.fr"
      }
    ];

    console.log("Insertion des entreprises...");
    const enterprises = await Enterprise.bulkCreate(enterprisesData);
    console.log(`${enterprises.length} entreprises insérées.`);

    // Données de test pour les offres
    const offersData = [
      {
        enterpriseId: 1,
        title: "Développeur Web Full Stack",
        description: "Recherche développeur expérimenté pour projet web innovant",
        requiredSkills: ["JavaScript", "React", "Node.js", "MongoDB"],
        location: "Paris",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 1,
        title: "Data Scientist Junior",
        description: "Stage en analyse de données et machine learning",
        requiredSkills: ["Python", "Machine Learning", "SQL", "Statistics"],
        location: "Paris",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 2,
        title: "Community Manager",
        description: "Gestion des réseaux sociaux et création de contenu",
        requiredSkills: ["Social Media", "Content Creation", "Photoshop", "Analytics"],
        location: "Lyon",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 3,
        title: "Développeur Python Santé",
        description: "Développement d'applications médicales avec Python",
        requiredSkills: ["Python", "Django", "API REST", "Healthcare"],
        location: "Marseille",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 4,
        title: "Ingénieur Énergie Renouvelable",
        description: "Stage sur projets d'énergie solaire et éolienne",
        requiredSkills: ["Renewable Energy", "AutoCAD", "Project Management", "Engineering"],
        location: "Bordeaux",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 5,
        title: "Développeur Fintech",
        description: "Développement de solutions de paiement et de trading",
        requiredSkills: ["Java", "Spring Boot", "Microservices", "Blockchain"],
        location: "Paris",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 6,
        title: "UX/UI Designer",
        description: "Design d'interfaces pour plateforme éducative",
        requiredSkills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        location: "Lille",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 7,
        title: "Logistics Analyst",
        description: "Optimisation des chaînes d'approvisionnement",
        requiredSkills: ["Supply Chain", "Excel", "ERP", "Data Analysis"],
        location: "Toulouse",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 8,
        title: "E-commerce Specialist",
        description: "Gestion de plateforme de vente en ligne",
        requiredSkills: ["E-commerce", "Digital Marketing", "SEO", "Analytics"],
        location: "Nice",
        status: "published",
        publishedAt: new Date()
      },
      {
        enterpriseId: 9,
        title: "Video Editor",
        description: "Montage vidéo et post-production",
        requiredSkills: ["Video Editing", "After Effects", "Premiere Pro", "Storytelling"],
        location: "Cannes",
        status: "published",
        publishedAt: new Date()
      }
    ];

    console.log("Insertion des offres...");
    const offers = await Offer.bulkCreate(offersData);
    console.log(`${offers.length} offres insérées.`);

    // Données de test pour les candidatures
    const applicationsData = [
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
      },
      {
        offerId: 3,
        studentUserId: 101,
        status: "rejected"
      },
      {
        offerId: 4,
        studentUserId: 104,
        status: "pending"
      },
      {
        offerId: 5,
        studentUserId: 102,
        status: "accepted"
      },
      {
        offerId: 6,
        studentUserId: 105,
        status: "pending"
      },
      {
        offerId: 7,
        studentUserId: 103,
        status: "pending"
      },
      {
        offerId: 8,
        studentUserId: 106,
        status: "rejected"
      },
      {
        offerId: 9,
        studentUserId: 104,
        status: "pending"
      },
      {
        offerId: 10,
        studentUserId: 105,
        status: "accepted"
      },
      {
        offerId: 2,
        studentUserId: 106,
        status: "pending"
      }
    ];

    console.log("Insertion des candidatures...");
    const applications = await Application.bulkCreate(applicationsData);
    console.log(`${applications.length} candidatures insérées.`);

    console.log("\n=== Résumé des données insérées ===");
    console.log(`- ${enterprises.length} entreprises`);
    console.log(`- ${offers.length} offres`);
    console.log(`- ${applications.length} candidatures`);
    console.log("\nDonnées de test insérées avec succès!");

  } catch (error) {
    console.error("Erreur lors de l'insertion des données:", error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter le script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
