// https://kulshekhar.github.io/ts-jest/docs/26.5/getting-started/installation
// Steps: 
// npm install --save-dev jest typescript ts-jest @types/jest
// npx ts-jest config:init
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    transform: {
      "^.+.tsx?$": ["ts-jest",{}],
    },
    setupFiles: ["dotenv/config"]
  };
  