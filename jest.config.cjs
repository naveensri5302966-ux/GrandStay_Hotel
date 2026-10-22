module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testMatch: ['**/src/**/*.test.jsx'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/test/styleMock.cjs',
    '.*services/hotelService.*': '<rootDir>/test/hotelServiceMock.cjs',
    '.*services/apiClient.*': '<rootDir>/test/apiClientMock.cjs',
    '.*utils/logger.*': '<rootDir>/test/loggerMock.cjs'
  }
};
