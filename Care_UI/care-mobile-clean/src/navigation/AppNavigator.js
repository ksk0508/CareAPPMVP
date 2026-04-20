import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "../screens/auth/LoginScreen";
import RegistrationScreen from "../screens/auth/RegistrationScreen";
import DoctorRegistrationScreen from "../screens/auth/DoctorRegistrationScreen";
import HomeScreen from "../screens/patient/HomeScreen";
import PatientProfileScreen from "../screens/patient/PatientProfileScreen";
import TaskHistoryScreen from "../screens/patient/TaskHistoryScreen";
import PatientDetailsScreen from "../screens/patient/PatientDetailsScreen";
import DoctorDashboard from "../screens/doctor/DoctorDashboard";
import PatientList from "../screens/doctor/PatientList";
import PatientAdherenceDetail from "../screens/doctor/PatientAdherenceDetail";
import CreateCarePlan from "../screens/doctor/CreateCarePlan";
import DoctorTaskLibrary from "../screens/doctor/DoctorTaskLibrary";
import CreateTaskScreen from "../screens/doctor/CreateTaskScreen";
import AddPatientScreen from "../screens/doctor/AddPatientScreen";
import DoctorAdherenceSummary from "../screens/doctor/DoctorAdherenceSummary";
import DoctorNotifications from "../screens/doctor/DoctorNotifications";
import { AppContext } from "../context/AppContext";

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />
      <Stack.Screen
        name="Register"
        component={RegistrationScreen}
        options={{ title: "Patient Registration" }}
      />
      <Stack.Screen
        name="DoctorRegister"
        component={DoctorRegistrationScreen}
        options={{ title: "Doctor Registration" }}
      />
    </Stack.Navigator>
  );
}

function PatientStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Today's Tasks", headerLeft: () => null }}
      />
      <Stack.Screen
        name="PatientProfileScreen"
        component={PatientProfileScreen}
        options={{ title: "My Profile" }}
      />
      <Stack.Screen
        name="TaskHistoryScreen"
        component={TaskHistoryScreen}
        options={{ title: "Task History" }}
      />
      <Stack.Screen
        name="PatientDetailsScreen"
        component={PatientDetailsScreen}
        options={{ title: "Patient Details & Diagnostics" }}
      />
    </Stack.Navigator>
  );
}

function DoctorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="DoctorDashboard"
        component={DoctorDashboard}
        options={{ title: "Doctor Dashboard", headerLeft: () => null }}
      />
      <Stack.Screen
        name="PatientList"
        component={PatientList}
        options={{ title: "My Patients" }}
      />
      <Stack.Screen
        name="PatientAdherenceDetail"
        component={PatientAdherenceDetail}
        options={({ route }) => ({
          title: route.params?.patientName || "Patient Detail",
        })}
      />
      <Stack.Screen
        name="CreateCarePlan"
        component={CreateCarePlan}
        options={{ title: "Create Care Plan" }}
      />
      <Stack.Screen
        name="TaskLibrary"
        component={DoctorTaskLibrary}
        options={{ title: "Task Library" }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: "Create Task" }}
      />
      <Stack.Screen
        name="AddPatient"
        component={AddPatientScreen}
        options={{ title: "Add Patient" }}
      />
      <Stack.Screen
        name="AdherenceSummary"
        component={DoctorAdherenceSummary}
        options={{ title: "Patient Adherence" }}
      />
      <Stack.Screen
        name="DoctorNotifications"
        component={DoctorNotifications}
        options={{ title: "Notifications" }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, loading, isDoctor, user } = useContext(AppContext);

  useEffect(() => {
    console.log("🔄 AppNavigator: State changed!");
    console.log("  - loading:", loading);
    console.log("  - isLoggedIn:", isLoggedIn);
    console.log("  - user:", user?.email || "NO USER");
    
    if (isLoggedIn === false && !loading) {
      console.log("⚠️  USER LOGGED OUT - Should show AuthStack");
    }
  }, [isLoggedIn, loading, user]);

  console.log("🧭 AppNavigator: Rendering - isLoggedIn:", isLoggedIn, "loading:", loading);

  if (loading) {
    console.log("⏳ AppNavigator: App loading...");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const screenToShow = !isLoggedIn ? "AuthStack" : isDoctor() ? "DoctorStack" : "PatientStack";
  console.log("📱 AppNavigator: Showing", screenToShow);

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthStack key="auth-stack" />
      ) : isDoctor() ? (
        <DoctorStack key="doctor-stack" />
      ) : (
        <PatientStack key="patient-stack" />
      )}
    </NavigationContainer>
  );
}
