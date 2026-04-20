import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Button,
} from "react-native";
import { AppContext } from "../../context/AppContext";
import client from "../../api/client";

export default function DoctorAdherenceSummary({ navigation }) {
  const { user } = useContext(AppContext);
  const [metrics, setMetrics] = useState(null);
  const [patients, setPatients] = useState([]);
  const [highRiskPatients, setHighRiskPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError("");
      setLoading(true);

      const doctorId = user?.practitionerId || user?.sub;
      if (!doctorId) {
        setError("Doctor ID not found");
        return;
      }

      // Fetch metrics
      const metricsResponse = await client.get(
        `/dashboard/${doctorId}/metrics`
      );
      setMetrics(metricsResponse.data);

      // Fetch all patients with adherence
      const patientsResponse = await client.get(`/dashboard/${doctorId}`);
      setPatients(patientsResponse.data?.patients || []);

      // Fetch high-risk patients
      const highRiskResponse = await client.get(
        `/dashboard/${doctorId}/high-risk`
      );
      setHighRiskPatients(highRiskResponse.data || []);
    } catch (err) {
      console.log("Error loading dashboard data:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load dashboard";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderMetricCard = (title, value, color = "#4CAF50") => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricLabel}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  const renderPatientAdherence = ({ item }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() =>
        navigation.navigate("PatientAdherenceDetail", {
          patientId: item.patientId,
          patientName: item.name,
        })
      }
    >
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{item.name}</Text>
        <View
          style={[
            styles.adherenceBadge,
            {
              backgroundColor:
                item.adherence >= 80
                  ? "#4CAF50"
                  : item.adherence >= 60
                  ? "#FFC107"
                  : "#F44336",
            },
          ]}
        >
          <Text style={styles.adheranceText}>{item.adherence}%</Text>
        </View>
      </View>
      <View style={styles.patientDetails}>
        <Text style={styles.detailText}>
          Active Plans: {item.activeCarePlans}
        </Text>
      </View>
      <Text style={styles.tapText}>Tap to view details →</Text>
    </TouchableOpacity>
  );

  const renderHighRiskPatient = ({ item }) => (
    <TouchableOpacity
      style={[styles.patientCard, styles.highRiskCard]}
      onPress={() =>
        navigation.navigate("PatientAdherenceDetail", {
          patientId: item.patientId,
          patientName: item.name,
        })
      }
    >
      <View style={styles.riskBadge}>
        <Text style={styles.riskText}>⚠️ HIGH RISK</Text>
      </View>
      <Text style={styles.patientName}>{item.name}</Text>
      <Text style={styles.adheranceWarning}>
        Adherence: {item.adherence}% (Below 60%)
      </Text>
      <Text style={styles.tapText}>Tap to view details →</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Doctor Dashboard</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {metrics && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard("Total Patients", metrics.totalPatients, "#2196F3")}
            {renderMetricCard("Active Plans", metrics.activePlans, "#4CAF50")}
            {renderMetricCard(
              "Avg Adherence",
              `${metrics.averageAdherence}%`,
              "#FFC107"
            )}
            {renderMetricCard(
              "Completed Tasks",
              metrics.completedTasks,
              "#4CAF50"
            )}
          </View>
        </View>
      )}

      {highRiskPatients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⚠️ High Risk Patients ({highRiskPatients.length})
          </Text>
          <Text style={styles.sectionSubtitle}>
            These patients have adherence below 60%
          </Text>
          <FlatList
            data={highRiskPatients}
            keyExtractor={(item) => item.patientId}
            scrollEnabled={false}
            renderItem={renderHighRiskPatient}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {patients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Adherence Overview</Text>
          <FlatList
            data={patients}
            keyExtractor={(item) => item.patientId}
            scrollEnabled={false}
            renderItem={renderPatientAdherence}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {patients.length === 0 && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No patients with active care plans yet
          </Text>
          <Button
            title="Create Care Plan"
            onPress={() => navigation.navigate("CreateCarePlan")}
          />
        </View>
      )}

      <View style={styles.footer} />
    </ScrollView>
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
  errorContainer: {
    backgroundColor: "#ffebee",
    margin: 15,
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
  },
  metricsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    padding: 15,
  },
  listContent: {
    paddingBottom: 12,
  },
  patientCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  highRiskCard: {
    borderLeftColor: "#F44336",
    backgroundColor: "#fff5f5",
  },
  riskBadge: {
    backgroundColor: "#F44336",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  riskText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  patientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  adherenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  adheranceText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  adheranceWarning: {
    fontSize: 14,
    color: "#F44336",
    fontWeight: "600",
    marginBottom: 8,
  },
  patientDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  tapText: {
    fontSize: 12,
    color: "#2196F3",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  footer: {
    height: 20,
  },
});
