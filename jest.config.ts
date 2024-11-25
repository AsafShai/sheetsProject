module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
        useBabelrc: true,
      },
    },
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper: {
      // Handle module resolution for imports
      '^src/(.*)$': '<rootDir>/src/$1',
    },
  };
  