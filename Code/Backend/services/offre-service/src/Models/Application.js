const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Application = sequelize.define("Application", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  offerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "offer_id",
  },
  studentUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "student_user_id",
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: "cover_letter",
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    allowNull: false,
    defaultValue: "pending",
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
  tableName: "applications",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

module.exports = Application;
