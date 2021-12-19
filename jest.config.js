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
};

module.exports = config;
