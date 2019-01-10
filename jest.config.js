module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      }
    },
  },
  setupFiles: [
    "./tests/jestsetup.ts"
  ],
  collectCoverageFrom: [
    "src/**/*",
    "!src/generated/**",
    "!src/shim*",
    "!src/api.ts",
  ],
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue',
    'ts',
    'tsx'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.(tsx?|jsx?)$': 'ts-jest',
    // '^.+\\.jsx?$': 'babel-jest'
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!(@ckeditor|lodash\-es|bootstrap-vue)/)",
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '**/*.spec.(ts|tsx)',
    '!**/eperusteet-ylops/**',
  ],
  testURL: 'http://localhost/'
}
