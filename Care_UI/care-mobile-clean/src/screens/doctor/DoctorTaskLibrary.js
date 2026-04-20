import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { getTasks, searchTasks } from "../../api/taskApi";

const SUGGESTED_TASKS = [
  {
    title: "Blood Pressure Monitoring",
    category: "Monitoring",
    description: "Daily blood pressure check with morning and evening readings.",
  },
  {
    title: "Medication Review",
    category: "Medication",
    description: "Review and confirm daily medication adherence and dosing.",
  },
  {
    title: "CBC Lab Test",
    category: "Lab Test",
    description: "Complete blood count to evaluate general health and anemia.",
  },
  {
    title: "Chest X-ray",
    category: "Imaging",
    description: "Order chest imaging to assess respiratory status.",
  },
  {
    title: "Physiotherapy Session",
    category: "Therapy",
    description: "Daily mobility and strengthening exercises for rehabilitation.",
  },
];

export default function DoctorTaskLibrary({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      console.log("Error loading task library:", err);
      setError(err.response?.data?.message || err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTasks();
      return;
    }

    try {
      setLoading(true);
      const response = await searchTasks("title", searchQuery);
      setTasks(response.data || []);
    } catch (err) {
      console.log("Error searching tasks:", err);
      setError(err.response?.data?.message || err.message || "Failed to search tasks");
    } finally {
      setLoading(false);
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskCategory}>{item.category}</Text>
      </View>
      <Text style={styles.taskDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Library</Text>
        <Button title="New Task" onPress={() => navigation.navigate("CreateTask")} />
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search task templates by title..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!loading}
        />
        <Button title="Search" onPress={handleSearch} disabled={loading} />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : tasks.length > 0 ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.taskId?.toString() || item.id?.toString() || item.title}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No task templates found</Text>
          <Text style={styles.emptyText}>
            Create your own tasks or use suggested templates below.
          </Text>
          <Text style={styles.suggestedHeader}>Suggested task templates</Text>
          {SUGGESTED_TASKS.map((task) => (
            <View key={task.title} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskCategory}>{task.category}</Text>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
  },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007AFF",
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
  },
  emptyContainer: {
    paddingTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  suggestedHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 30,
  },
});
