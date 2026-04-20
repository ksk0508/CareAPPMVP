import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { createPatient } from "../../api/patientApi";

export default function AddPatientScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreatePatient = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.email.indexOf("@") === -1) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age, 10) || null,
        gender: formData.gender,
        notes: formData.notes,
      };

      await createPatient(payload);
      Alert.alert("Success", "Patient profile created successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.log("Error creating patient:", err);
      setError(err.response?.data?.message || err.message || "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Patient</Text>
      <Text style={styles.subtitle}>
        Create and assign a patient to your practice. Once created, the patient can be linked to care plans.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.label}>Full Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Patient name"
        value={formData.name}
        onChangeText={(value) => setFormData({ ...formData, name: value })}
        editable={!loading}
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="Patient email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(value) => setFormData({ ...formData, email: value })}
        editable={!loading}
      />

      <Text style={styles.label}>Phone *</Text>
      <TextInput
        style={styles.input}
        placeholder="Patient phone number"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(value) => setFormData({ ...formData, phone: value })}
        editable={!loading}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={formData.age}
        onChangeText={(value) => setFormData({ ...formData, age: value })}
        editable={!loading}
      />

      <Text style={styles.label}>Gender</Text>
      <TextInput
        style={styles.input}
        placeholder="Male, Female, Other"
        value={formData.gender}
        onChangeText={(value) => setFormData({ ...formData, gender: value })}
        editable={!loading}
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Clinical summary, conditions, or special notes"
        value={formData.notes}
        onChangeText={(value) => setFormData({ ...formData, notes: value })}
        editable={!loading}
        multiline
        numberOfLines={4}
      />

      <Button
        title={loading ? "Creating..." : "Create Patient"}
        onPress={handleCreatePatient}
        disabled={loading}
      />

      {loading && <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#c62828",
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
});
