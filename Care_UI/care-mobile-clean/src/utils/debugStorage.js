import AsyncStorage from "@react-native-async-storage/async-storage";

export const debugStorage = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    
    console.log("=== AsyncStorage Debug ===");
    console.log("Token:", token ? token.substring(0, 50) + "..." : null);
    console.log("User:", user ? JSON.parse(user) : null);
    
    return { token: !!token, user: !!user };
  } catch (error) {
    console.log("Debug error:", error);
  }
};

export const clearAllStorage = async () => {
  try {
    console.log("🧹 Clearing all storage...");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    console.log("✅ Storage cleared");
  } catch (error) {
    console.log("❌ Clear error:", error);
  }
};
