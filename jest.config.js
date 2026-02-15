/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/unit/mobile/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/mobile/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@supabase/.*)",
  ],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFilesAfterEnv: ["<rootDir>/tests/mobile-setup.ts"],
};
