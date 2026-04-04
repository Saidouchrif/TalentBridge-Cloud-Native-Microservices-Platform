const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Offer = sequelize.define("Offer", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  enterpriseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "enterprise_id",
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  requiredSkills: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: "required_skills",
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("published", "closed", "draft"),
    allowNull: false,
    defaultValue: "published",
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "published_at",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "updated_at",
  },
}, {
  tableName: "offers",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Offer;
