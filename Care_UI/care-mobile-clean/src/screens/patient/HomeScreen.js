import React, { useEffect, useState, useContext } from "react";
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { getDailyTasks, completeTask, skipTask } from "../../api/taskApi";
import { AppContext } from "../../context/AppContext";
import { debugStorage, clearAllStorage } from "../../utils/debugStorage";

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { logout, user, isLoggedIn } = useContext(AppContext);

  useEffect(() => {
    loadTasks();
  }, []);

  // Monitor when user logs out
  useEffect(() => {
    console.log("📊 HomeScreen: isLoggedIn changed to:", isLoggedIn);
    console.log("👤 HomeScreen: user is:", user);
    if (!isLoggedIn) {
      console.log("🔴 HomeScreen: User is not logged in - should redirect to login");
    }
  }, [isLoggedIn, user]);

  const loadTasks = async () => {
    try {
      setError("");
      if (!refreshing) setLoading(true);

      // Format date to ISO string (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0];
      
      const res = await getDailyTasks(today);
      setTasks(res.data || []);
    } catch (err) {
      console.log("Error loading tasks:", err);
      
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.details ||
        err.message ||
        "Failed to load tasks";
      
      setError(errorMsg);
      
      // If unauthorized, logout
      if (err.response?.status === 401) {
        Alert.alert("Session Expired", "Please login again");
        await logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      await completeTask(task.taskId, task.scheduledTime);
      Alert.alert("Success", "Task completed!");
      loadTasks();
    } catch (err) {
      console.log("Error completing task:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to complete task";
      Alert.alert("Error", errorMsg);
    }
  };

  const handleSkip = async (task) => {
    Alert.alert(
      "Skip Task",
      "Are you sure you want to skip this task?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Skip",
          onPress: async () => {
            try {
              await skipTask(task.taskId, task.scheduledTime);
              Alert.alert("Success", "Task skipped!");
              loadTasks();
            } catch (err) {
              console.log("Error skipping task:", err);
              const errorMsg =
                err.response?.data?.message ||
                err.message ||
                "Failed to skip task";
              Alert.alert("Error", errorMsg);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await logout();
            console.log("✅ HomeScreen: Logout successful");
          } catch (error) {
            console.error("❌ HomeScreen: Logout failed", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "missed":
        return "#F44336";
      case "skipped":
        return "#999";
      default:
        return "#666";
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Tasks</Text>
          <Button title="Logout" onPress={handleLogout} color="#ff6b6b" />
        </View>

        {/* Debug Section - Remove in Production */}
        <View style={styles.debugSection}>
          <Text style={styles.debugText}>👤 User: {user?.email || "Unknown"}</Text>
          <Button 
            title="📊 Debug Storage" 
            onPress={debugStorage}
            color="#666"
          />
          <Button 
            title="🧹 Clear All Data" 
            onPress={clearAllStorage}
            color="#ff9800"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Button title="Retry" onPress={loadTasks} />
          </View>
        ) : null}

        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for today</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item, index) => `${item.taskId}-${index}`}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    {item.status || "Pending"}
                  </Text>
                </View>

                <Text style={styles.taskType}>Type: {item.type || "N/A"}</Text>
                <Text style={styles.taskTime}>
                  ⏰ {formatTime(item.scheduledTime)}
                </Text>

                <View style={styles.buttonContainer}>
                  <View style={styles.buttonWrapper}>
                    <Button
                      title="✓ Complete"
                      onPress={() => handleComplete(item)}
                      color="#4CAF50"
                      disabled={item.status === "completed" || item.status === "skipped"}
                    />
                  </View>
                  <View style={styles.buttonWrapper}>
                    <Button
                      title="✕ Skip"
                      onPress={() => handleSkip(item)}
                      color="#999"
                      disabled={item.status === "completed" || item.status === "skipped"}
                    />
                  </View>
                </View>
              </View>
            )}
          />
        )}

        <View style={styles.footer}>
          <Button title="Refresh" onPress={loadTasks} />
          <View style={styles.buttonSpacer} />
          <Button
            title="View Profile"
            onPress={() => navigation.navigate("PatientProfileScreen")}
            color="#2196F3"
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Task History"
            onPress={() => navigation.navigate("TaskHistoryScreen")}
            color="#FF9800"
          />
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
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  taskCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    paddingRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  taskType: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
  },
  taskTime: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 10,
  },
  buttonSpacer: {
    height: 10,
  },
  debugSection: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
});