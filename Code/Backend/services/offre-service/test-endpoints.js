// Script de test pour vérifier tous les endpoints du offre-service
console.log("=== TEST DES ENDPOINTS OFFRE-SERVICE ===");

const api = "http://localhost:5003/api";

async function testEndpoints() {
  try {
    console.log("1. Test santé du service...");
    const healthResponse = await fetch("http://localhost:5003/health");
    const health = await healthResponse.json();
    console.log("✅ Santé:", health);

    console.log("\n2. Test liste des offres...");
    const offersResponse = await fetch(`${api}/offers`);
    const offers = await offersResponse.json();
    console.log("✅ Offres:", offers.offers?.length || 0, "trouvées");

    console.log("\n3. Test création d'offre...");
    const newOffer = {
      enterpriseId: 1,
      title: "Test Developer Position",
      description: "Offre de test pour développeur",
      requiredSkills: ["JavaScript", "React"],
      location: "Paris",
      status: "published"
    };

    const createResponse = await fetch(`${api}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOffer)
    });

    if (createResponse.ok) {
      const created = await createResponse.json();
      console.log("✅ Offre créée:", created.offer.title);
      
      const offerId = created.offer.id;
      
      console.log("\n4. Test candidature...");
      const applicationResponse = await fetch(`${api}/offers/${offerId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter: "Je suis très intéressé par ce poste..."
        })
      });

      if (applicationResponse.ok) {
        console.log("✅ Candidature envoyée");
      } else {
        console.log("❌ Erreur candidature:", await applicationResponse.text());
      }

      console.log("\n5. Test filtre par statut...");
      const filteredResponse = await fetch(`${api}/offers?status=published`);
      const filtered = await filteredResponse.json();
      console.log("✅ Offres publiées:", filtered.offers?.length || 0);

      console.log("\n6. Test filtre par localisation...");
      const locationResponse = await fetch(`${api}/offers?location=Paris`);
      const locationOffers = await locationResponse.json();
      console.log("✅ Offres à Paris:", locationOffers.offers?.length || 0);

      console.log("\n7. Test filtre par compétences...");
      const skillsResponse = await fetch(`${api}/offers?skills=JavaScript`);
      const skillsOffers = await skillsResponse.json();
      console.log("✅ Offres avec JavaScript:", skillsOffers.offers?.length || 0);

      console.log("\n8. Test modification d'offre...");
      const updateResponse = await fetch(`${api}/offers/${offerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Updated Developer Position",
          status: "closed"
        })
      });

      if (updateResponse.ok) {
        console.log("✅ Offre mise à jour");
      } else {
        console.log("❌ Erreur mise à jour:", await updateResponse.text());
      }

    } else {
      console.log("❌ Erreur création offre:", await createResponse.text());
    }

    console.log("\n9. Vérification finale...");
    const finalOffers = await fetch(`${api}/offers`);
    const finalData = await finalOffers.json();
    console.log("✅ Total offres:", finalData.offers.length);

    console.log("\n=== TESTS TERMINÉS AVEC SUCCÈS ===");

  } catch (error) {
    console.error("\n❌ ERREUR LORS DES TESTS:", error.message);
    
    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Solution: Démarrez le service avec:");
      console.log("   node.exe src/server.js");
    }
  }
}

testEndpoints();
