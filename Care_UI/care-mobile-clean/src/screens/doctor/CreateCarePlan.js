import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import {
  createCarePlan,
  assignTasksToCarePlan,
} from "../../api/carePlanApi";
import { getTasks, searchTasks } from "../../api/taskApi";
import { getDoctorPatients } from "../../api/patientApi";
import { AppContext } from "../../context/AppContext";

export default function CreateCarePlan({ route, navigation }) {
  const { user } = useContext(AppContext);
  const patientIdFromParams = route.params?.patientId;

  const [step, setStep] = useState(1); // Step 1: Care Plan Info, Step 2: Select Tasks
  const [carePlanData, setCarePlanData] = useState({
    title: "",
    description: "",
    patientId: patientIdFromParams || "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [patientOptions, setPatientOptions] = useState([]);
  const [patientPickerVisible, setPatientPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null);
  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    buildDateOptions();
    loadDoctorPatients();
  }, []);

  const buildDateOptions = () => {
    const today = new Date();
    const options = [];
    for (let i = 0; i < 90; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formatted = date.toISOString().split("T")[0];
      options.push(formatted);
    }
    setDateOptions(options);
  };

  const loadDoctorPatients = async () => {
    if (!user?.practitionerId && !user?.sub) {
      return;
    }

    try {
      const doctorId = user.practitionerId || user.sub;
      const response = await getDoctorPatients(doctorId);
      const patientList = Array.isArray(response.data) ? response.data : [];
      setPatientOptions(
        patientList.map((patient) => ({
          patientId: patient.id,
          patientName: patient.name || `Patient ${patient.id}`,
        }))
      );
    } catch (err) {
      console.log("Error loading doctor patient options:", err);
    }
  };

  const handleInputChange = (field, value) => {
    setCarePlanData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const validateStep1 = () => {
    if (!carePlanData.title.trim()) {
      setError("Care plan title is required");
      return false;
    }
    if (!carePlanData.patientId.trim()) {
      setError("Patient ID is required");
      return false;
    }
    if (!carePlanData.startDate.trim()) {
      setError("Start date is required");
      return false;
    }
    if (!carePlanData.endDate.trim()) {
      setError("End date is required");
      return false;
    }
    if (new Date(carePlanData.endDate) <= new Date(carePlanData.startDate)) {
      setError("End date must be after start date");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const searchForTasks = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a search term to search tasks.");
      return;
    }

    try {
      setLoading(true);
      const response = await searchTasks("title", searchQuery);
      setAvailableTasks(response.data || []);
    } catch (err) {
      console.log("Error searching tasks:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to search tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      setAvailableTasks(response.data || []);
      setSearchQuery("");
    } catch (err) {
      console.log("Error loading all tasks:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Failed to load tasks. Try searching by a keyword instead."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setCarePlanData((prev) => ({
      ...prev,
      patientId: patient.patientId,
    }));
    setPatientPickerVisible(false);
    setError("");
  };

  const handleDateSelect = (dateValue) => {
    if (!datePickerField) {
      return;
    }

    setCarePlanData((prev) => ({
      ...prev,
      [datePickerField]: dateValue,
    }));
    setDatePickerVisible(false);
    setDatePickerField(null);
  };

  const toggleTaskSelection = (task) => {
    const isSelected = selectedTasks.some((t) => t.taskId === task.id);
    if (isSelected) {
      setSelectedTasks(selectedTasks.filter((t) => t.taskId !== task.id));
    } else {
      setSelectedTasks([
        ...selectedTasks,
        {
          taskId: task.id,
          title: task.title,
          type: task.category,
        },
      ]);
    }
  };

  const handleCreateCarePlan = async () => {
    try {
      setError("");
      setLoading(true);

      if (!user?.practitionerId && !user?.sub) {
        setError("Doctor ID not found");
        return;
      }

      const doctorId = user.practitionerId || user.sub;

      // Create care plan
      const carePlanResponse = await createCarePlan({
        ...carePlanData,
        practitionerId: doctorId,
        status: "Active",
      });

      const carePlanId = carePlanResponse.data?.id || carePlanResponse.data?.carePlanId;

      if (!carePlanId) {
        setError("Failed to create care plan - no ID returned");
        return;
      }

      // Assign tasks to care plan if selected
      if (selectedTasks.length > 0) {
        try {
          await assignTasksToCarePlan(carePlanId, {
            taskIds: selectedTasks.map((t) => t.taskId),
          });
        } catch (taskErr) {
          console.log("Warning: Tasks assignment partial failure:", taskErr);
          Alert.alert(
            "Note",
            `Care plan created, but some tasks could not be assigned: ${
              taskErr.response?.data?.message || taskErr.message
            }`
          );
        }
      }

      Alert.alert(
        "Success",
        "Care plan created successfully" +
          (selectedTasks.length > 0 ? " with tasks assigned" : ""),
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      console.log("Error creating care plan:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to create care plan";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {step === 1 ? "Create Care Plan" : "Select Tasks"}
        </Text>
        <Button title="Close" onPress={() => navigation.goBack()} />
      </View>

      <ScrollView style={styles.scrollView}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {step === 1 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Care Plan Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Hypertension Management"
                value={carePlanData.title}
                onChangeText={(text) => handleInputChange("title", text)}
                editable={!loading}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Care plan description..."
                value={carePlanData.description}
                onChangeText={(text) => handleInputChange("description", text)}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Patient ID *</Text>
              {patientOptions.length > 0 ? (
                <View style={styles.patientSelectWrapper}>
                  <TouchableOpacity
                    style={styles.patientSelect}
                    onPress={() => setPatientPickerVisible(true)}
                    disabled={loading}
                  >
                    <Text style={styles.patientSelectText}>
                      {carePlanData.patientId
                        ? `${carePlanData.patientId} ${patientOptions.find((p) => p.patientId === carePlanData.patientId)?.patientName ? `(${patientOptions.find((p) => p.patientId === carePlanData.patientId)?.patientName})` : ""}`
                        : "Tap to select a patient"}
                    </Text>
                  </TouchableOpacity>
                  <Button
                    title="Select Patient"
                    onPress={() => setPatientPickerVisible(true)}
                    disabled={loading}
                  />
                </View>
              ) : (
                <Text style={styles.helpText}>
                  No assigned patients were found yet. Enter a Patient ID manually.
                </Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Enter patient ID"
                value={carePlanData.patientId}
                onChangeText={(text) => handleInputChange("patientId", text)}
                editable={!patientIdFromParams && !loading}
              />
              <Text style={styles.helpText}>
                Choose a patient from the dropdown above if available, or type the patient ID.
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfSection}>
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => {
                    setDatePickerField("startDate");
                    setDatePickerVisible(true);
                  }}
                  disabled={loading}
                >
                  <Text
                  style={[
                    styles.dateInputText,
                    !carePlanData.startDate && styles.dateInputPlaceholder,
                  ]}
                >
                  {carePlanData.startDate || "Select start date"}
                </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfSection}>
                <Text style={styles.label}>End Date *</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => {
                    setDatePickerField("endDate");
                    setDatePickerVisible(true);
                  }}
                  disabled={loading}
                >
                  <Text
                  style={[
                    styles.dateInputText,
                    !carePlanData.endDate && styles.dateInputPlaceholder,
                  ]}
                >
                  {carePlanData.endDate || "Select end date"}
                </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                title={loading ? "Creating..." : "Next: Select Tasks"}
                onPress={handleNextStep}
                disabled={loading}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search and Select Tasks</Text>
              <Text style={styles.helpText}>
                Enter a task title and tap Search. Then tap a task row to select it.
              </Text>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search tasks by title..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  editable={!loading}
                />
                <Button
                  title={loading ? "Searching..." : "Search"}
                  onPress={searchForTasks}
                  disabled={loading}
                />
              </View>
              <View style={styles.searchContainer}>
                <Button
                  title={loading ? "Loading..." : "Search All Tasks"}
                  onPress={loadAllTasks}
                  disabled={loading}
                />
              </View>
              <Text style={styles.helpText}>
                Tasks are care activities already defined in the system. Search by keywords (e.g. medication, exercise, monitoring) and tap a task to assign it.
              </Text>
              <View style={styles.searchContainer}>
                <Button
                  title="Manage Task Templates"
                  onPress={() => navigation.navigate("TaskLibrary")}
                />
              </View>

              {availableTasks.length > 0 ? (
                <>
                  <Text style={styles.infoText}>
                    Found {availableTasks.length} tasks. Select tasks to add to
                    this care plan:
                  </Text>
                  <FlatList
                    data={availableTasks}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      const isSelected = selectedTasks.some(
                        (t) => t.taskId === item.id
                      );
                      return (
                        <TouchableOpacity
                          onPress={() => toggleTaskSelection(item)}
                          style={[
                            styles.taskCard,
                            isSelected && styles.taskCardSelected,
                          ]}
                        >
                          <View style={styles.taskCheckbox}>
                            <Text style={styles.checkbox}>
                              {isSelected ? "✓" : ""}
                            </Text>
                          </View>
                          <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            <Text style={styles.taskType}>{item.category}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />

                  {selectedTasks.length > 0 ? (
                    <View style={styles.selectedSummary}>
                      <Text style={styles.selectedText}>
                        {selectedTasks.length} tasks selected
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.emptySearchContainer}>
                  <Text style={styles.emptySearchText}>
                    Enter a search term and click Search to find tasks
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <Button
                title="Back to Info"
                onPress={() => setStep(1)}
                color="#666"
              />
              <View style={styles.buttonSpacer} />
              <Button
                title={loading ? "Creating..." : "Create Care Plan"}
                onPress={handleCreateCarePlan}
                disabled={loading || !carePlanData.title}
                color="#4CAF50"
              />
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={patientPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPatientPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <Button
                title="Close"
                onPress={() => setPatientPickerVisible(false)}
              />
            </View>
            <FlatList
              data={patientOptions}
              keyExtractor={(item) => item.patientId.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handlePatientSelect(item)}
                >
                  <Text style={styles.modalItemText}>
                    {item.patientName} ({item.patientId})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={datePickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <Button title="Close" onPress={() => setDatePickerVisible(false)} />
            </View>
            <FlatList
              data={dateOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleDateSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              initialNumToRender={10}
            />
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Processing...</Text>
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfSection: {
    flex: 0.48,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    marginRight: 10,
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  patientSelectWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  patientSelect: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    marginRight: 10,
  },
  patientSelectText: {
    color: "#333",
  },
  dateInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
  },
  dateInputText: {
    color: "#333",
  },
  dateInputPlaceholder: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    maxHeight: "80%",
    padding: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 14,
    color: "#333",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  taskCardSelected: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  taskType: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  selectedSummary: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 6,
    marginVertical: 12,
  },
  selectedText: {
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "600",
  },
  emptySearchContainer: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  emptySearchText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
  },
  actions: {
    marginTop: 20,
    marginBottom: 30,
  },
  buttonSpacer: {
    height: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
});
