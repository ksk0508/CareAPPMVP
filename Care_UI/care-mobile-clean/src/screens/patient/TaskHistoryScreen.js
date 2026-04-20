import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { getDailyTasks } from "../../api/taskApi";

export default function TaskHistoryScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, completed, skipped, pending

  useEffect(() => {
    loadTaskHistory();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedFilter, tasks]);

  const loadTaskHistory = async () => {
    try {
      setError("");
      setLoading(true);

      // Fetch tasks for past 7 days
      const taskList = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        try {
          const response = await getDailyTasks(dateStr);
          if (Array.isArray(response.data)) {
            taskList.push(...response.data);
          }
        } catch (err) {
          console.log(`Error loading tasks for ${dateStr}:`, err);
          // Continue with other dates
        }
      }

      // Remove duplicates and sort by scheduled date
      const uniqueTasks = Array.from(
        new Map(taskList.map((task) => [task.taskId, task])).values()
      ).sort((a, b) => {
        const dateA = new Date(a.scheduledDate || 0);
        const dateB = new Date(b.scheduledDate || 0);
        return dateB - dateA;
      });

      setTasks(uniqueTasks);
    } catch (err) {
      console.log("Error loading task history:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load task history";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...tasks];

    if (selectedFilter !== "all") {
      filtered = filtered.filter((task) => {
        if (selectedFilter === "completed") return task.status === "Completed";
        if (selectedFilter === "skipped") return task.status === "Skipped";
        if (selectedFilter === "pending") return task.status === "Pending";
        return true;
      });
    }

    setFilteredTasks(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#4CAF50";
      case "Skipped":
        return "#FF9800";
      case "Missed":
        return "#F44336";
      case "Pending":
        return "#2196F3";
      default:
        return "#999";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return "✓";
      case "Skipped":
        return "⊘";
      case "Missed":
        return "✗";
      case "Pending":
        return "⊙";
      default:
        return "•";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading task history...</Text>
      </View>
    );
  }

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const skippedCount = tasks.filter((t) => t.status === "Skipped").length;
  const missedCount = tasks.filter((t) => t.status === "Missed").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task History</Text>
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button title="Retry" onPress={loadTaskHistory} />
        </View>
      ) : null}

      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{skippedCount}</Text>
          <Text style={styles.statLabel}>Skipped</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{missedCount}</Text>
          <Text style={styles.statLabel}>Missed</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "completed" && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter("completed")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "completed" && styles.filterTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "pending" && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "pending" && styles.filterTextActive,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === "skipped" && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedFilter("skipped")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "skipped" && styles.filterTextActive,
            ]}
          >
            Skipped
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item, index) => `${item.taskId}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.statusBadge}>
                  <Text
                    style={[
                      styles.statusIcon,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {getStatusIcon(item.status)}
                  </Text>
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskType}>{item.type}</Text>
                </View>
                <Text
                  style={[
                    styles.taskStatus,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <View style={styles.taskMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Scheduled:</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(item.scheduledDate)} @ {formatTime(item.scheduledTime)}
                  </Text>
                </View>
                {item.completedDate && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Completed:</Text>
                    <Text style={styles.metaValue}>
                      {formatDate(item.completedDate)}
                    </Text>
                  </View>
                )}
                {item.notes && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Notes:</Text>
                    <Text style={styles.metaValue}>{item.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedFilter === "all"
              ? "No tasks found"
              : `No ${selectedFilter} tasks found`}
          </Text>
          <Button title="Refresh" onPress={loadTaskHistory} />
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "white",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  filterText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "white",
  },
  taskCard: {
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statusIcon: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  taskType: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  taskMeta: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 6,
  },
  metaItem: {
    marginBottom: 6,
    flexDirection: "row",
  },
  metaLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    minWidth: 80,
  },
  metaValue: {
    fontSize: 12,
    color: "#333",
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
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
    marginBottom: 20,
    textAlign: "center",
  },
});
