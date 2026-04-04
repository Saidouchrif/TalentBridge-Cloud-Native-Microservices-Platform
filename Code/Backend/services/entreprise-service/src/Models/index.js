const sequelize = require("../config/db");

const Enterprise = require("./Enterprise");
const Offer = require("./Offer");
const Application = require("./Application");

// Associations Sequelize pour permettre les jointures logiques.
Enterprise.hasMany(Offer, { foreignKey: "enterpriseId", as: "offers" });
Offer.belongsTo(Enterprise, { foreignKey: "enterpriseId", as: "enterprise" });

Offer.hasMany(Application, { foreignKey: "offerId", as: "applications" });
Application.belongsTo(Offer, { foreignKey: "offerId", as: "offer" });

module.exports = {
  sequelize,
  Enterprise,
  Offer,
  Application
};

