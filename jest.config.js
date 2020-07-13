module.exports = {
  // for mongoose
  setupFilesAfterEnv: ["jest-enzyme"],
  testEnvironmentOptions: {
    enzymeAdapter: "react16"
  },
  testEnvironment: "enzyme"
  //preset: "@shelf/jest-mongodb"
}
