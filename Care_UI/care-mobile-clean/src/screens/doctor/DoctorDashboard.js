import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { getMetrics, getDashboard } from "../../api/dashboardApi";
import { AppContext } from "../../context/AppContext";

export default function DoctorDashboard({ navigation }) {
  const { user, logout } = useContext(AppContext);
  const [metrics, setMetrics] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setError("");
      setLoading(true);

      if (!user?.practitionerId && !user?.sub) {
        setError("Doctor ID not found in user data");
        return;
      }

      const doctorId = user.practitionerId || user.sub;

      const [metricsData, dashboardData] = await Promise.all([
        getMetrics(doctorId),
        getDashboard(doctorId),
      ]);

      setMetrics(metricsData.data);
      setPatients(dashboardData.data || []);
    } catch (err) {
      console.log("Error loading dashboard:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load dashboard";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = typeof window !== "undefined" && window.confirm
      ? window.confirm("Are you sure you want to logout?")
      : true;

    if (!confirmed) return;

    try {
      console.log("🔐 Calling logout from AppContext");
      await logout();
      console.log("✅ DoctorDashboard: Logout successful - user should be cleared");
    } catch (error) {
      console.error("❌ DoctorDashboard: Logout failed", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handleViewPatientDetail = (patientId, patientName) => {
    navigation.navigate("PatientAdherenceDetail", {
      patientId,
      patientName,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Doctor Dashboard</Text>
          <Button title="Logout" onPress={handleLogout} color="#ff6b6b" />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Button title="Retry" onPress={loadDashboard} />
          </View>
        ) : null}

        {metrics ? (
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.totalPatients}</Text>
                <Text style={styles.metricLabel}>Total Patients</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.activePatients}</Text>
                <Text style={styles.metricLabel}>Active Today</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.averageAdherence}%</Text>
                <Text style={styles.metricLabel}>Avg Adherence</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{metrics.completedTasks}</Text>
                <Text style={styles.metricLabel}>Completed</Text>
              </View>
            </View>
          </View>
        ) : null}

        {patients.length > 0 ? (
          <View style={styles.patientsSection}>
            <Text style={styles.sectionTitle}>Today's Task Status</Text>
            <FlatList
              data={patients}
              keyExtractor={(item, index) => `${item.patientId}-${index}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    handleViewPatientDetail(item.patientId, item.patientName)
                  }
                >
                  <View style={styles.patientCard}>
                    <View style={styles.patientHeader}>
                      <Text style={styles.patientName}>{item.patientName}</Text>
                      <Text
                        style={[
                          styles.adherenceBadge,
                          {
                            backgroundColor:
                              item.adherencePercentage >= 75
                                ? "#4CAF50"
                                : item.adherencePercentage >= 50
                                ? "#FF9800"
                                : "#F44336",
                          },
                        ]}
                      >
                        {item.adherencePercentage}%
                      </Text>
                    </View>
                    <Text style={styles.patientMissed}>
                      Missed: {item.missedTasks}
                    </Text>
                    <Button
                      title="View Details"
                      onPress={() =>
                        handleViewPatientDetail(item.patientId, item.patientName)
                      }
                      color="#007AFF"
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No patient data available</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="📊 Adherence Summary"
            onPress={() => navigation.navigate("AdherenceSummary")}
            color="#4CAF50"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="🔔 Notifications"
            onPress={() => navigation.navigate("DoctorNotifications")}
            color="#FF9800"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="+ Create Care Plan"
            onPress={() => navigation.navigate("CreateCarePlan")}
            color="#2196F3"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Manage Tasks"
            onPress={() => navigation.navigate("TaskLibrary")}
            color="#9C27B0"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="✏️ Create Task"
            onPress={() => navigation.navigate("CreateTask")}
            color="#673AB7"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Add Patient"
            onPress={() => navigation.navigate("AddPatient")}
            color="#00BCD4"
          />
          <View style={styles.buttonSpacer} />
          <Button title="View My Patients" onPress={() => navigation.navigate("PatientList")} />
          <View style={styles.buttonSpacer} />
          <Button title="Refresh" onPress={loadDashboard} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 15,
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    marginBottom: 10,
    fontSize: 14,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  metricLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  patientsSection: {
    marginBottom: 20,
  },
  patientCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  adherenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    color: "white",
    fontWeight: "600",
  },
  patientMissed: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  actionButtons: {
    marginVertical: 20,
    gap: 10,
  },
  buttonSpacer: {
    height: 10,
  },
});
