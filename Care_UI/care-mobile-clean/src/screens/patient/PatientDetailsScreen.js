import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { AppContext } from "../../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PatientDetailsScreen({ route, navigation }) {
  const { user } = useContext(AppContext);
  const [patientDetails, setPatientDetails] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDiagnostic, setShowAddDiagnostic] = useState(false);
  const [newDiagnostic, setNewDiagnostic] = useState({
    diagnosisName: "",
    severity: "Medium",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        
        // Get patient ID from route params or from user context
        const patientId = route.params?.patientId || user?.sub;
        
        if (!patientId) {
          Alert.alert("Error", "Patient ID not found");
          return;
        }

        // Fetch patient details
        const patientResponse = await fetch(
          `http://localhost:5160/api/patients/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const patientData = await patientResponse.json();
        setPatientDetails(patientData);

        // Fetch diagnostics
        const diagnosticsResponse = await fetch(
          `http://localhost:5160/api/diagnostics/patient/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const diagnosticsData = await diagnosticsResponse.json();
        setDiagnostics(diagnosticsData || []);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        Alert.alert("Error", "Failed to load patient details");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [route, user]);

  const handleAddDiagnostic = async () => {
    if (!newDiagnostic.diagnosisName) {
      Alert.alert("Error", "Please enter diagnosis name");
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const patientId = route.params?.patientId || user?.sub;

      const response = await fetch(
        "http://localhost:5160/api/diagnostics",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientId,
            diagnosisName: newDiagnostic.diagnosisName,
            diagnosisDate: new Date().toISOString(),
            severity: newDiagnostic.severity,
            notes: newDiagnostic.notes,
            status: "Active",
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Diagnostic added successfully");
        setShowAddDiagnostic(false);
        setNewDiagnostic({ diagnosisName: "", severity: "Medium", notes: "" });
        
        // Refresh diagnostics
        const updatedResponse = await fetch(
          `http://localhost:5160/api/diagnostics/patient/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedData = await updatedResponse.json();
        setDiagnostics(updatedData || []);
      } else {
        const error = await response.json();
        Alert.alert("Error", error.message || "Failed to add diagnostic");
      }
    } catch (error) {
      console.error("Error adding diagnostic:", error);
      Alert.alert("Error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading patient details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Patient Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Patient Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{patientDetails?.name || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{patientDetails?.email || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Age:</Text>
          <Text style={styles.value}>{patientDetails?.age || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{patientDetails?.gender || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{patientDetails?.phone || "N/A"}</Text>
        </View>
      </View>

      {/* Diagnostics Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Medical Diagnostics</Text>
          <Button
            title="+ Add"
            onPress={() => setShowAddDiagnostic(true)}
            color="#4CAF50"
          />
        </View>

        {diagnostics.length === 0 ? (
          <Text style={styles.emptyText}>No diagnostics recorded yet</Text>
        ) : (
          <FlatList
            data={diagnostics}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.diagnosticCard, { borderLeftColor: getSeverityColor(item.severity) }]}>
                <View style={styles.diagnosticHeader}>
                  <Text style={styles.diagnosisName}>{item.diagnosisName}</Text>
                  <Text style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                    {item.severity}
                  </Text>
                </View>
                <Text style={styles.diagnosisDate}>
                  Date: {new Date(item.diagnosisDate).toLocaleDateString()}
                </Text>
                {item.notes && <Text style={styles.diagnosisNotes}>Notes: {item.notes}</Text>}
                {item.icd10Code && <Text style={styles.icdCode}>ICD-10: {item.icd10Code}</Text>}
                <Text style={styles.diagnosisStatus}>Status: {item.status}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Add Diagnostic Modal */}
      <Modal
        visible={showAddDiagnostic}
        onRequestClose={() => setShowAddDiagnostic(false)}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Diagnostic</Text>

          <TextInput
            style={styles.input}
            placeholder="Diagnosis Name *"
            value={newDiagnostic.diagnosisName}
            onChangeText={(value) =>
              setNewDiagnostic({ ...newDiagnostic, diagnosisName: value })
            }
            editable={!submitting}
          />

          <Text style={styles.label}>Severity Level</Text>
          <View style={styles.severityOptions}>
            {["Low", "Medium", "High", "Critical"].map((level) => (
              <Button
                key={level}
                title={level}
                onPress={() =>
                  setNewDiagnostic({ ...newDiagnostic, severity: level })
                }
                color={
                  newDiagnostic.severity === level ? "#2196F3" : "#ccc"
                }
              />
            ))}
          </View>

          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Notes"
            value={newDiagnostic.notes}
            onChangeText={(value) =>
              setNewDiagnostic({ ...newDiagnostic, notes: value })
            }
            multiline
            numberOfLines={4}
            editable={!submitting}
          />

          <View style={styles.modalButtonContainer}>
            <Button
              title="Add Diagnostic"
              onPress={handleAddDiagnostic}
              disabled={submitting}
              color="#4CAF50"
            />
            <Button
              title="Cancel"
              onPress={() => setShowAddDiagnostic(false)}
              disabled={submitting}
              color="#f44336"
            />
          </View>

          {submitting && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "#d32f2f";
    case "high":
      return "#f57c00";
    case "medium":
      return "#fbc02d";
    case "low":
      return "#388e3c";
    default:
      return "#999";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },
  diagnosticCard: {
    backgroundColor: "#fafafa",
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  diagnosticHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  diagnosisName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  severityBadge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
  diagnosisDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  diagnosisNotes: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontStyle: "italic",
  },
  icdCode: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  diagnosisStatus: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },
  multilineInput: {
    textAlignVertical: "top",
  },
  severityOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 20,
  },
  loader: {
    marginTop: 20,
  },
});
