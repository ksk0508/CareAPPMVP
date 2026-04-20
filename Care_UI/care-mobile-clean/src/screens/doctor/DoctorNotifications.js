import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Button,
  Alert,
} from "react-native";
import { AppContext } from "../../context/AppContext";
import client from "../../api/client";

export default function DoctorNotifications({ navigation }) {
  const { user } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  const loadNotifications = async () => {
    try {
      setError("");
      const response = await client.get("/notifications/history");
      setNotifications(response.data || []);
    } catch (err) {
      console.log("Error loading notifications:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load notifications";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await client.get("/notifications/preferences");
      setPreferences(response.data);
    } catch (err) {
      console.log("Error loading notification preferences:", err);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const newEnabled = !preferences?.enabled;
      await client.post("/notifications/enable-disable", {
        enabled: newEnabled,
      });
      setPreferences({ ...preferences, enabled: newEnabled });
      Alert.alert(
        "Success",
        `Notifications ${newEnabled ? "enabled" : "disabled"}`
      );
    } catch (err) {
      console.log("Error toggling notifications:", err);
      Alert.alert("Error", "Failed to update notification preferences");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      "high-adherence": "✓",
      "low-adherence": "⚠️",
      "task-complete": "✓",
      "care-plan-created": "📋",
      "patient-added": "👤",
      default: "ℹ️",
    };
    return icons[type] || icons.default;
  };

  const getNotificationColor = (type) => {
    const colors = {
      "high-adherence": "#4CAF50",
      "low-adherence": "#F44336",
      "task-complete": "#2196F3",
      "care-plan-created": "#FF9800",
      "patient-added": "#9C27B0",
      default: "#666",
    };
    return colors[type] || colors.default;
  };

  const renderNotification = ({ item }) => (
    <View
      style={[
        styles.notificationCard,
        { borderLeftColor: getNotificationColor(item.type) },
      ]}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </Text>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title || "Notification"}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>

      {preferences && (
        <View style={styles.preferencesSection}>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Notifications</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                {
                  backgroundColor: preferences.enabled ? "#4CAF50" : "#ccc",
                },
              ]}
              onPress={handleToggleNotifications}
            >
              <Text style={styles.toggleText}>
                {preferences.enabled ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.preferenceSubtext}>
            {preferences.enabled
              ? "You will receive notifications about patient adherence and care plan updates"
              : "Notifications are currently disabled"}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>
            You don't have any notifications yet. Patient adherence alerts will appear here.
          </Text>
        </View>
      )}
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
  preferencesSection: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  preferenceSubtext: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
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
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  notificationCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
