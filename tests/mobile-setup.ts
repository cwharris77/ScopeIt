import "@testing-library/react-native/build/matchers/extend-expect";

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => mockRouter),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: "Link",
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    SafeAreaView: View,
    SafeAreaProvider: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-linking
jest.mock("expo-linking", () => ({
  createURL: jest.fn((path: string) => `scopeit://${path}`),
}));

// Suppress NativeAnimatedHelper warning (handled by jest-expo or not needed in this version)
// jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
