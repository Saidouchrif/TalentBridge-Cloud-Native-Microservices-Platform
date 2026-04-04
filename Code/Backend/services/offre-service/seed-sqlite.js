require("dotenv").config();

const { Offer, Application } = require("./src/Models");

async function seedOffers() {
  console.log("🌱 Démarrage du peuplement des données d'offres...");

  try {
    // Synchroniser la base de données
    await require("./src/database").sync({ force: true });
    console.log("✅ Base de données synchronisée.");

    // Créer des offres de test
    const offers = [
      {
        enterpriseId: 1,
        title: "Développeur Web Full Stack",
        description: "Nous recherchons un développeur expérimenté pour rejoindre notre équipe tech.",
        requiredSkills: ["JavaScript", "React", "Node.js", "MongoDB"],
        location: "Paris",
        status: "published",
        publishedAt: new Date(),
      },
      {
        enterpriseId: 1,
        title: "Data Scientist",
        description: "Poste en data science pour analyser et modéliser nos données clients.",
        requiredSkills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
        location: "Lyon",
        status: "published",
        publishedAt: new Date(),
      },
      {
        enterpriseId: 2,
        title: "DevOps Engineer",
        description: "Ingénieur DevOps pour gérer notre infrastructure cloud.",
        requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        location: "Marseille",
        status: "published",
        publishedAt: new Date(),
      },
      {
        enterpriseId: 2,
        title: "Product Manager",
        description: "Chef de produit pour piloter nos projets digitaux.",
        requiredSkills: ["Agile", "Scrum", "Product Management", "Analytics"],
        location: "Paris",
        status: "draft",
      },
      {
        enterpriseId: 3,
        title: "UX/UI Designer",
        description: "Designer pour créer des interfaces utilisateur modernes et intuitives.",
        requiredSkills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
        location: "Bordeaux",
        status: "published",
        publishedAt: new Date(),
      },
    ];

    // Insérer les offres
    const createdOffers = await Offer.bulkCreate(offers);
    console.log(`✅ ${createdOffers.length} offres créées.`);

    // Créer quelques candidatures de test
    const applications = [
      {
        offerId: 1,
        studentUserId: "student-001",
        coverLetter: "Je suis très intéressé par ce poste de développeur full stack. J'ai 3 ans d'expérience avec React et Node.js.",
        status: "pending",
      },
      {
        offerId: 1,
        studentUserId: "student-002",
        coverLetter: "Développeur junior passionné, je souhaite rejoindre une équipe dynamique pour apprendre et grandir.",
        status: "accepted",
      },
      {
        offerId: 2,
        studentUserId: "student-003",
        coverLetter: "Data scientist avec une spécialisation en machine learning et deep learning.",
        status: "pending",
      },
      {
        offerId: 3,
        studentUserId: "student-001",
        coverLetter: "Expérience en DevOps avec Docker et Kubernetes sur des projets AWS.",
        status: "rejected",
      },
      {
        offerId: 5,
        studentUserId: "student-004",
        coverLetter: "Designer UX/UI avec 5 ans d'expérience dans la création d'applications mobiles.",
        status: "pending",
      },
    ];

    // Insérer les candidatures
    const createdApplications = await Application.bulkCreate(applications);
    console.log(`✅ ${createdApplications.length} candidatures créées.`);

    console.log("🎉 Peuplement des données terminé avec succès !");
    console.log("\n📊 Résumé:");
    console.log(`- Offres: ${createdOffers.length}`);
    console.log(`- Candidatures: ${createdApplications.length}`);
    console.log("\n🔗 URLs de test:");
    console.log("- http://localhost:5003/health");
    console.log("- http://localhost:5003/api/offers");
    console.log("- http://localhost:5003/api/offers?status=published");

  } catch (error) {
    console.error("❌ Erreur lors du peuplement:", error);
    process.exit(1);
  }
}

// Exécuter le peuplement
seedOffers().then(() => {
  process.exit(0);
});
