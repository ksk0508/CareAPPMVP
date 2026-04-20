import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { AppContext } from "../../context/AppContext";

export default function PatientProfileScreen({ navigation }) {
  const { user, logout } = useContext(AppContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setError("");
      setLoading(true);

      if (!user) {
        setError("User data not available");
        return;
      }

      // Use user data from context (from JWT token decoded)
      setProfileData({
        patientId: user.sub || user.patientId,
        firstName: user.given_name || user.firstName || "User",
        lastName: user.family_name || user.lastName || "",
        email: user.email || "Not provided",
        phone: user.phone || "Not provided",
        dateOfBirth: user.dob || "Not provided",
        gender: user.gender || "Not specified",
        bloodType: user.blood_type || "Not specified",
        medicalConditions: user.medical_conditions
          ? user.medical_conditions.split(",")
          : ["None specified"],
        allergies: user.allergies ? user.allergies.split(",") : ["None specified"],
        medications: user.medications
          ? user.medications.split(",")
          : ["None specified"],
        emergencyContact: user.emergency_contact || "Not provided",
        emergencyPhone: user.emergency_phone || "Not provided",
      });
    } catch (err) {
      console.log("Error loading profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            console.log("✅ PatientProfileScreen: Logout successful");
          } catch (error) {
            console.error("❌ PatientProfileScreen: Logout failed", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Button title="Logout" onPress={handleLogout} color="#ff6b6b" />
      </View>

      <ScrollView style={styles.scrollView}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Button title="Retry" onPress={loadProfileData} />
          </View>
        ) : null}

        {profileData ? (
          <>
            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>
                    {profileData.firstName} {profileData.lastName}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Patient ID</Text>
                  <Text style={styles.infoValue}>{profileData.patientId}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{profileData.email}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{profileData.phone}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  <Text style={styles.infoValue}>{profileData.dateOfBirth}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{profileData.gender}</Text>
                </View>
              </View>
            </View>

            {/* Medical Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Blood Type</Text>
                  <Text style={styles.infoValue}>{profileData.bloodType}</Text>
                </View>
                <View style={styles.divider} />

                <View style={styles.listContainer}>
                  <Text style={styles.infoLabel}>Medical Conditions</Text>
                  {profileData.medicalConditions.map((condition, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.listItemBullet}>•</Text>
                      <Text style={styles.listItemText}>{condition.trim()}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.listContainer}>
                  <Text style={styles.infoLabel}>Allergies</Text>
                  {profileData.allergies.map((allergy, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={[styles.listItemBullet, { color: "#F44336" }]}>
                        ⚠
                      </Text>
                      <Text style={styles.listItemText}>{allergy.trim()}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.listContainer}>
                  <Text style={styles.infoLabel}>Current Medications</Text>
                  {profileData.medications.map((med, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.listItemBullet}>💊</Text>
                      <Text style={styles.listItemText}>{med.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Emergency Contact Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Contact Name</Text>
                  <Text style={styles.infoValue}>
                    {profileData.emergencyContact}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>
                    {profileData.emergencyPhone}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <Button title="Refresh" onPress={loadProfileData} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    marginBottom: 10,
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 15,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 6,
  },
  listItemBullet: {
    fontSize: 14,
    marginRight: 10,
    color: "#666",
    minWidth: 20,
  },
  listItemText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  actions: {
    padding: 15,
    marginBottom: 20,
  },
});
