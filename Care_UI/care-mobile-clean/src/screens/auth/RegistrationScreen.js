import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import { register } from "../../api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppContext } from "../../context/AppContext";
import { decodeJWT } from "../../utils/jwtDecode";

export default function RegistrationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
    gender: "Male",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: contextLogin } = useContext(AppContext);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📝 RegistrationScreen: Registering user", formData.email);
      const res = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        phone: formData.phone,
      });

      console.log("✅ RegistrationScreen: Registration successful");
      
      // Extract user info from token using proper decoder
      const decodedToken = decodeJWT(res.data.accessToken);
      
      if (!decodedToken) {
        throw new Error("Failed to decode JWT token");
      }

      console.log("💾 RegistrationScreen: Storing token and user");
      // Store token and user data
      await AsyncStorage.setItem("token", res.data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(decodedToken));

      console.log("🔄 RegistrationScreen: Updating app context");
      // Update app context
      contextLogin(res.data.accessToken, decodedToken);

      console.log("✅ RegistrationScreen: Registration flow complete");
      Alert.alert("Success", "Registration completed successfully!");
    } catch (err) {
      console.log("Registration error:", err);

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.details ||
        err.message ||
        "Registration failed - Check network connection";

      setError(errorMsg);
      Alert.alert("Registration Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Care Execution Platform</Text>
      <Text style={styles.subtitle}>Patient Registration</Text>

      {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={formData.name}
        onChangeText={(value) => setFormData({ ...formData, name: value })}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={formData.email}
        onChangeText={(value) => setFormData({ ...formData, email: value })}
        editable={!loading}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={formData.phone}
        onChangeText={(value) => setFormData({ ...formData, phone: value })}
        editable={!loading}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Age (optional)"
        value={formData.age}
        onChangeText={(value) => setFormData({ ...formData, age: value })}
        editable={!loading}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Gender (Male/Female/Other) *"
        value={formData.gender}
        onChangeText={(value) => setFormData({ ...formData, gender: value })}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 6 chars) *"
        value={formData.password}
        onChangeText={(value) => setFormData({ ...formData, password: value })}
        secureTextEntry
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password *"
        value={formData.confirmPassword}
        onChangeText={(value) => setFormData({ ...formData, confirmPassword: value })}
        secureTextEntry
        editable={!loading}
      />

      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={loading}
        color="#4CAF50"
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      <View style={styles.loginLinkContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <Button
          title="Login"
          onPress={() => navigation.navigate("Login")}
          disabled={loading}
          color="#2196F3"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "#f44336",
    textAlign: "center",
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "500",
  },
  loader: {
    marginTop: 20,
  },
  loginLinkContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
});
