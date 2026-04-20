import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import { AppContext } from "../../context/AppContext";
import { decodeJWT } from "../../utils/jwtDecode";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorRegistrationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    specialization: "General Practice",
    hospital: "",
    department: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: contextLogin } = useContext(AppContext);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.licenseNumber || !formData.specialization) {
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
      console.log("👨‍⚕️ DoctorRegistrationScreen: Registering doctor", formData.email);
      
      const response = await fetch("http://localhost:5160/api/auth/register-doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          hospital: formData.hospital,
          department: formData.department,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("✅ DoctorRegistrationScreen: Registration successful");
      
      // Extract user info from token
      const decodedToken = decodeJWT(data.accessToken);
      
      if (!decodedToken) {
        throw new Error("Failed to decode JWT token");
      }

      console.log("💾 DoctorRegistrationScreen: Decoded token:", decodedToken);
      console.log("💾 DoctorRegistrationScreen: User role:", decodedToken.role);
      
      // Ensure role is set correctly
      if (!decodedToken.role) {
        console.warn("⚠️  DoctorRegistrationScreen: Role not found in token, setting to Doctor");
        decodedToken.role = "Doctor";
      }
      
      // Store token and user data
      await AsyncStorage.setItem("token", data.accessToken);
      await AsyncStorage.setItem("user", JSON.stringify(decodedToken));

      console.log("🔄 DoctorRegistrationScreen: Updating app context with role:", decodedToken.role);
      // Update app context
      contextLogin(data.accessToken, decodedToken);

      console.log("✅ DoctorRegistrationScreen: Registration flow complete - user role is", decodedToken.role);
      Alert.alert("Success", "Doctor registration completed successfully!");
    } catch (err) {
      console.log("Doctor registration error:", err);
      const errorMsg = err.message || "Registration failed - Check network connection";
      setError(errorMsg);
      Alert.alert("Registration Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Care Execution Platform</Text>
      <Text style={styles.subtitle}>Doctor Registration</Text>

      {error ? <Text style={styles.errorText}>⚠️ {error}</Text> : null}

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
        placeholder="License Number *"
        value={formData.licenseNumber}
        onChangeText={(value) => setFormData({ ...formData, licenseNumber: value })}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Specialization (e.g., Cardiology) *"
        value={formData.specialization}
        onChangeText={(value) => setFormData({ ...formData, specialization: value })}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Hospital/Clinic"
        value={formData.hospital}
        onChangeText={(value) => setFormData({ ...formData, hospital: value })}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Department"
        value={formData.department}
        onChangeText={(value) => setFormData({ ...formData, department: value })}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(value) => setFormData({ ...formData, phoneNumber: value })}
        editable={!loading}
        keyboardType="phone-pad"
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
        title={loading ? "Registering..." : "Register as Doctor"}
        onPress={handleRegister}
        disabled={loading}
      />

      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
        disabled={loading}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#ffe6e6",
    borderRadius: 5,
  },
  loader: {
    marginTop: 20,
  },
});
