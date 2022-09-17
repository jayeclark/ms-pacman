const config = {
  verbose: true,
  transform: {
    '\\.js$': 'esbuild-runner/jest',
  },
  testPathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/',
    '/node_modules/',
    '/cypress/',
    'node_modules/',
    'cypress/',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'mspacman.js',
    '**/components/**',
    '**/data/boards.js',
    '**/utilities/**',
  ],
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/cypress/',
    '/data/.+.json',
  ],
};

module.exports = config;
