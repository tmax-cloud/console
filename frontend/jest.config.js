module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^dnd-core$': 'dnd-core/dist/cjs',
    '^react-dnd$': 'react-dnd/dist/cjs',
    '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
  },
  transform: {
    '.(ts|tsx|js|jsx)': './node_modules/ts-jest/preprocessor.js',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(lodash-es|@console|@novnc|@spice-project)/.*)'],
  testRegex: '.*\\.spec\\.(ts|tsx|js|jsx)$',
  testURL: 'http://localhost',
  setupFiles: ['./__mocks__/localStorage.ts', './__mocks__/matchMedia.js', './__mocks__/serverFlags.js', './__mocks__/mutationObserver.js'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  coverageDirectory: '__coverage__',
  coverageReporters: ['json', 'lcov', 'text', 'text-summary'],
  collectCoverageFrom: ['public/*.{js,jsx,ts,tsx}', 'public/{components,module,ui}/**/*.{js,jsx,ts,tsx}', 'packages/*/src/**/*.{js,jsx,ts,tsx}', '!**/node_modules/**'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
