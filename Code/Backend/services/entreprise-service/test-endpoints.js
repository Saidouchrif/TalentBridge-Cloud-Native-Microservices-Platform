// Script de test pour vérifier tous les endpoints
console.log("=== TEST DES ENDPOINTS API ===");

const api = "http://localhost:5002/api";

async function testEndpoints() {
  try {
    console.log("1. Test santé du service...");
    const healthResponse = await fetch("http://localhost:5002/health");
    const health = await healthResponse.json();
    console.log("✅ Santé:", health);

    console.log("\n2. Test liste des entreprises...");
    const enterprisesResponse = await fetch(`${api}/entreprises`);
    const enterprises = await enterprisesResponse.json();
    console.log("✅ Entreprises:", enterprises.enterprises?.length || 0, "trouvées");

    console.log("\n3. Test création d'entreprise...");
    const newEnterprise = {
      name: "Test Enterprise",
      sector: "Informatique",
      description: "Entreprise de test",
      addressLine1: "123 Test Street",
      city: "Test City",
      postalCode: "12345",
      country: "France",
      phone: "+33 1 23 45 67 89",
      website: "https://test.com"
    };

    const createResponse = await fetch(`${api}/entreprises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEnterprise)
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log("✅ Entreprise créée:", created.enterprise.name);
      
      const enterpriseId = created.enterprise.id;
      
      console.log("\n4. Test création d'offre...");
      const newOffer = {
        title: "Développeur Test",
        description: "Offre de test",
        requiredSkills: ["JavaScript", "React"],
        location: "Paris",
        status: "published"
      };

      const offerResponse = await fetch(`${api}/entreprises/${enterpriseId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOffer)
      });

      if (offerResponse.ok) {
        const offer = await offerResponse.json();
        console.log("✅ Offre créée:", offer.offer.title);
        
        console.log("\n5. Test candidature...");
        const applicationResponse = await fetch(`${api}/offers/${offer.offer.id}/applications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        });

        if (applicationResponse.ok) {
          console.log("✅ Candidature envoyée");
        } else {
          console.log("❌ Erreur candidature:", await applicationResponse.text());
        }
      } else {
        console.log("❌ Erreur création offre:", await offerResponse.text());
      }
    } else {
      console.log("❌ Erreur création entreprise:", await createResponse.text());
    }

    console.log("\n6. Vérification finale...");
    const finalEnterprises = await fetch(`${api}/entreprises`);
    const finalData = await finalEnterprises.json();
    console.log("✅ Total entreprises:", finalData.enterprises.length);

    const finalOffers = await fetch(`${api}/offers`);
    const offersData = await finalOffers.json();
    console.log("✅ Total offres:", offersData.offers.length);

    console.log("\n=== TESTS TERMINÉS AVEC SUCCÈS ===");

  } catch (error) {
    console.error("\n❌ ERREUR LORS DES TESTS:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Solution: Démarrez le serveur avec:");
      console.log("   node.exe src/server.js");
    }
  }
}

testEndpoints();
