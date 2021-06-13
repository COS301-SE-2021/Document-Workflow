export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build/', "<rootDir>/app/"],
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};