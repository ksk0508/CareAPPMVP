import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  FlatList,
} from "react-native";
import { getPatientAdherence } from "../../api/dashboardApi";

export default function PatientAdherenceDetail({ route, navigation }) {
  const { patientId, patientName } = route.params || {};
  const [adherenceData, setAdherenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatientAdherence();
  }, []);

  const loadPatientAdherence = async () => {
    try {
      setError("");
      setLoading(true);

      if (!patientId) {
        setError("Patient ID is missing");
        return;
      }

      const response = await getPatientAdherence(patientId);
      setAdherenceData(response.data);
    } catch (err) {
      console.log("Error loading patient adherence:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load adherence data";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getAdherenceColor = (percentage) => {
    if (percentage >= 75) return "#4CAF50";
    if (percentage >= 50) return "#FF9800";
    return "#F44336";
  };

  const getAdherenceStatus = (percentage) => {
    if (percentage >= 75) return "Excellent";
    if (percentage >= 50) return "Moderate";
    return "Poor";
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading adherence data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{patientName}</Text>
          <Text style={styles.headerSubtitle}>Adherence Details</Text>
        </View>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>

      <ScrollView style={styles.scrollView}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Button title="Retry" onPress={loadPatientAdherence} />
          </View>
        ) : null}

        {adherenceData ? (
          <>
            <View style={styles.mainMetricContainer}>
              <View
                style={[
                  styles.adherenceCircle,
                  {
                    borderColor: getAdherenceColor(adherenceData.adherencePercentage),
                  },
                ]}
              >
                <Text style={styles.adherenceValue}>
                  {adherenceData.adherencePercentage}%
                </Text>
                <Text style={styles.adherenceStatus}>
                  {getAdherenceStatus(adherenceData.adherencePercentage)}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Status</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusCard}>
                  <Text style={styles.statusLabel}>Completed</Text>
                  <Text style={[styles.statusValue, { color: "#4CAF50" }]}>
                    {adherenceData.completedTasks}
                  </Text>
                </View>
                <View style={styles.statusCard}>
                  <Text style={styles.statusLabel}>Pending</Text>
                  <Text style={[styles.statusValue, { color: "#2196F3" }]}>
                    {adherenceData.pendingTasks}
                  </Text>
                </View>
                <View style={styles.statusCard}>
                  <Text style={styles.statusLabel}>Skipped</Text>
                  <Text style={[styles.statusValue, { color: "#FF9800" }]}>
                    {adherenceData.skippedTasks}
                  </Text>
                </View>
                <View style={styles.statusCard}>
                  <Text style={styles.statusLabel}>Missed</Text>
                  <Text style={[styles.statusValue, { color: "#F44336" }]}>
                    {adherenceData.missedTasks}
                  </Text>
                </View>
              </View>
            </View>

            {adherenceData.metrics ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trends</Text>
                <View style={styles.trendCard}>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Current Adherence</Text>
                    <Text style={styles.trendValue}>
                      {adherenceData.metrics.currentAdherence}%
                    </Text>
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Weekly Average</Text>
                    <Text style={styles.trendValue}>
                      {adherenceData.metrics.weeklyAdherence}%
                    </Text>
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Monthly Average</Text>
                    <Text style={styles.trendValue}>
                      {adherenceData.metrics.monthlyAdherence}%
                    </Text>
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Trend</Text>
                    <Text
                      style={[
                        styles.trendValue,
                        {
                          color:
                            adherenceData.metrics.trend === "Improving"
                              ? "#4CAF50"
                              : adherenceData.metrics.trend === "Declining"
                              ? "#F44336"
                              : "#FF9800",
                        },
                      ]}
                    >
                      {adherenceData.metrics.trend}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {adherenceData.metrics?.dailyBreakdown &&
            adherenceData.metrics.dailyBreakdown.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Breakdown</Text>
                <FlatList
                  data={adherenceData.metrics.dailyBreakdown}
                  keyExtractor={(item, index) => `${item.date}-${index}`}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View style={styles.dailyCard}>
                      <Text style={styles.dailyDate}>{item.date}</Text>
                      <View style={styles.dailyBar}>
                        <View
                          style={[
                            styles.dailyFill,
                            {
                              width: `${item.adherencePercentage}%`,
                              backgroundColor: getAdherenceColor(
                                item.adherencePercentage
                              ),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.dailyPercentage}>
                        {item.adherencePercentage}%
                      </Text>
                    </View>
                  )}
                />
              </View>
            ) : null}
          </>
        ) : null}

        <View style={styles.actions}>
          <Button title="Refresh" onPress={loadPatientAdherence} />
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
  headerSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
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
  mainMetricContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  adherenceCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  adherenceValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
  },
  adherenceStatus: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
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
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  trendCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  trendLabel: {
    fontSize: 14,
    color: "#666",
  },
  trendValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dailyCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  dailyDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  dailyBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  dailyFill: {
    height: "100%",
    borderRadius: 3,
  },
  dailyPercentage: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  actions: {
    paddingVertical: 20,
  },
});
