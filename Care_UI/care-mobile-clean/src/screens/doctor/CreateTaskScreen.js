import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { createTask } from "../../api/taskApi";
import { AppContext } from "../../context/AppContext";

const TASK_CATEGORIES = [
  "Medication",
  "Lab Test",
  "Imaging",
  "Monitoring",
  "Therapy",
  "Lifestyle",
];

export default function CreateTaskScreen({ navigation }) {
  const { user } = useContext(AppContext);
  const [taskData, setTaskData] = useState({
    title: "",
    category: "Medication",
    description: "",
    instructions: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateTask = async () => {
    if (!taskData.title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!taskData.description.trim()) {
      setError("Task description is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔧 Creating task:", taskData);
      await createTask(taskData);
      Alert.alert("Success", "Task template created successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error("❌ Error creating task:", err);
      console.error("❌ Error response data:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create task";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Task Template</Text>
      <Text style={styles.subtitle}>
        Build reusable task templates for medication, lab tests, imaging, monitoring, and therapy.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.label}>Task Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Daily Blood Pressure Check"
        value={taskData.title}
        onChangeText={(text) => setTaskData({ ...taskData, title: text })}
        editable={!loading}
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryRow}>
        {TASK_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              taskData.category === category && styles.categoryButtonActive,
            ]}
            onPress={() => setTaskData({ ...taskData, category })}
            disabled={loading}
          >
            <Text
              style={[
                styles.categoryText,
                taskData.category === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Explain the purpose and expected action for this task"
        value={taskData.description}
        onChangeText={(text) => setTaskData({ ...taskData, description: text })}
        editable={!loading}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Instructions</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add instructions or patient guidance"
        value={taskData.instructions}
        onChangeText={(text) => setTaskData({ ...taskData, instructions: text })}
        editable={!loading}
        multiline
        numberOfLines={4}
      />

      <Button
        title={loading ? "Creating..." : "Create Task"}
        onPress={handleCreateTask}
        disabled={loading}
      />

      {loading && <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryText: {
    color: "#333",
    fontSize: 13,
  },
  categoryTextActive: {
    color: "white",
  },
  errorText: {
    color: "#c62828",
    marginBottom: 10,
  },
  loader: {
    marginTop: 20,
  },
});
