const Offer = require("./Offer");
const Application = require("./Application");

// Définir les associations
Application.belongsTo(Offer, { foreignKey: "offerId", as: "offer" });
Offer.hasMany(Application, { foreignKey: "offerId", as: "applications" });

module.exports = {
  Offer,
  Application,
};
