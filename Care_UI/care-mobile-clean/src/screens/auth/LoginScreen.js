import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { login } from "../../api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../../context/AppContext";
import { decodeJWT } from "../../utils/jwtDecode";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: contextLogin } = useContext(AppContext);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔐 LoginScreen: Attempting login for", email);
      const res = await login(email, password);

      console.log("✅ LoginScreen: Login successful");
      console.log("📝 LoginScreen: Access token received");

      // Extract user info from token using proper decoder
      const decodedToken = decodeJWT(res.data.accessToken);
      
      if (!decodedToken) {
        throw new Error("Failed to decode JWT token");
      }

      console.log("💾 LoginScreen: Storing token and user");
      // Store token and user data
      await AsyncStorage.setItem("token", res.data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(decodedToken));

      console.log("🔄 LoginScreen: Updating app context");
      // Update app context
      contextLogin(res.data.accessToken, decodedToken);

      console.log("✅ LoginScreen: Login flow complete");
      // Navigate happens automatically through context change
    } catch (err) {
      console.log("❌ LoginScreen: Login error:", err);
      console.log("Error message:", err.message);
      console.log("Error code:", err.code);
      console.log("Response status:", err.response?.status);
      console.log("Response data:", err.response?.data);

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.details ||
        err.message ||
        "Login failed - Check network connection";
      
      setError(errorMsg);
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Care Execution Platform</Text>
      <Text style={styles.subtitle}>Login</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        editable={!loading}
      />

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <Button
          title="Sign Up as Patient"
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
          color="#4CAF50"
        />
      </View>

      <View style={styles.divider}>
        <Text style={styles.dividerText}>— OR —</Text>
      </View>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Are you a doctor? </Text>
        <Button
          title="Register as Doctor"
          onPress={() => navigation.navigate("DoctorRegister")}
          disabled={loading}
          color="#2196F3"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: "white",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  loader: {
    marginTop: 20,
  },
  signupContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  divider: {
    marginVertical: 15,
    alignItems: "center",
  },
  dividerText: {
    color: "#999",
    fontSize: 12,
  },
});