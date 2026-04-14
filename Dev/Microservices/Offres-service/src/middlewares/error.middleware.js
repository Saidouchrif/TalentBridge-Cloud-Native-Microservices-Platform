function gestionnaireErreur(erreur, _requete, reponse, _suivant) {
  if (erreur.name === "SequelizeValidationError") {
    return reponse.status(400).json({
      message: "Les donn\u00e9es envoy\u00e9es sont invalides",
    });
  }

  if (erreur.name === "SequelizeUniqueConstraintError") {
    return reponse.status(409).json({
      message: "Cette ressource existe d\u00e9j\u00e0 ou est en conflit",
    });
  }

  if (
    erreur.name === "SequelizeDatabaseError" ||
    erreur.name === "SequelizeConnectionError"
  ) {
    return reponse.status(500).json({
      message: "Une erreur interne s'est produite",
    });
  }

  const codeStatut =
    typeof erreur.statusCode === "number" &&
    erreur.statusCode >= 400 &&
    erreur.statusCode < 600
      ? erreur.statusCode
      : 500;

  const message =
    codeStatut === 500
      ? "Une erreur interne s'est produite"
      : typeof erreur.message === "string" && erreur.message.length > 0
        ? erreur.message
        : "Une erreur s'est produite";

  return reponse.status(codeStatut).json({ message });
}

module.exports = { gestionnaireErreur };
