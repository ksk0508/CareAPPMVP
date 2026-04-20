import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getDoctorPatients } from "../../api/patientApi";
import { AppContext } from "../../context/AppContext";

export default function PatientList({ navigation }) {
  const { user } = useContext(AppContext);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchText, patients]);

  const loadPatients = async () => {
    try {
      setError("");
      setLoading(true);

      if (!user?.practitionerId && !user?.sub) {
        setError("Doctor ID not found");
        return;
      }

      const doctorId = user.practitionerId || user.sub;
      const response = await getDoctorPatients(doctorId);

      const loadedPatients = Array.isArray(response.data)
        ? response.data.map((patient) => ({
            patientId: patient.id,
            patientName: patient.name || "Unknown Patient",
            carePlansCount: patient.carePlansCount || 0,
            lastCarePlanStatus: patient.lastCarePlanStatus || "N/A",
            lastCarePlanDate: patient.lastCarePlanDate || null,
          }))
        : [];

      setPatients(loadedPatients);
    } catch (err) {
      console.log("Error loading patient list:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load patients";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    const filtered = patients.filter((patient) =>
      patient.patientName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPatients(filtered);
  };

  const handleViewAdherence = (patientId, patientName) => {
    navigation.navigate("PatientAdherenceDetail", {
      patientId,
      patientName,
    });
  };

  const handleSelectPatient = (patient) => {
    Alert.alert(`${patient.patientName}`, `Care Plans: ${patient.carePlansCount}`, [
      {
        text: "View Adherence",
        onPress: () => handleViewAdherence(patient.patientId, patient.patientName),
      },
      {
        text: "Create New Plan",
        onPress: () =>
          navigation.navigate("CreateCarePlan", { patientId: patient.patientId }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading patient list...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Patients</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients by name..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Retry" onPress={loadPatients} />
        </View>
      ) : null}

      {filteredPatients.length > 0 ? (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.patientId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectPatient(item)}>
              <View style={styles.patientCard}>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  <Text style={styles.plansText}>
                    Care Plans: {item.carePlansCount}
                  </Text>
                  <Text style={styles.statusText}>
                    Last Status: {item.lastCarePlanStatus}
                  </Text>
                </View>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchText
              ? "No patients found matching your search"
              : "No patients assigned yet"}
          </Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="+ Create New Care Plan"
          onPress={() => navigation.navigate("CreateCarePlan")}
          color="#4CAF50"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Add Patient"
          onPress={() => navigation.navigate("AddPatient")}
          color="#FF9800"
        />
        <View style={styles.buttonSpacer} />
        <Button title="Refresh" onPress={loadPatients} />
      </View>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    fontSize: 14,
    color: "#333",
  },
  clearButton: {
    fontSize: 18,
    color: "#999",
    marginLeft: 10,
    padding: 5,
  },
  errorContainer: {
    margin: 15,
    padding: 12,
    backgroundColor: "#ffebee",
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    marginBottom: 10,
    fontSize: 14,
  },
  patientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  plansText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    color: "#999",
  },
  arrowText: {
    fontSize: 24,
    color: "#ccc",
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  listContent: {
    paddingVertical: 8,
  },
  footer: {
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  buttonSpacer: {
    height: 10,
  },
});
