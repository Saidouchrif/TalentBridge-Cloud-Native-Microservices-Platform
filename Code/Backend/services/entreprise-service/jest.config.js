module.exports = {
  // On cible les tests dans `tests/`
  testMatch: ["**/tests/**/*.test.js"],
  // On utilise le pattern communjs pour rester cohérent avec le reste du repo
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"]
};

