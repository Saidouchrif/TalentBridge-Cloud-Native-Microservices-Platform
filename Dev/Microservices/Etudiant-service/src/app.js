const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routesApi = require("./routes/index");
const { gestionnaireErreur } = require("./middlewares/error.middleware");

const application = express();

application.use(helmet());
application.use(cors());
application.use(express.json({ limit: "1mb" }));

application.get("/sante", (_requete, reponse) => {
  reponse.json({ statut: "ok", service: "etudiant-service" });
});

application.use("/api/etudiant", routesApi);

application.use((_requete, reponse) => {
  reponse.status(404).json({ message: "Route inconnue" });
});

application.use(gestionnaireErreur);

module.exports = application;
