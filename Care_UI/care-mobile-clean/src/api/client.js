import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const client = axios.create({
  baseURL: "http://0.0.0.0:5160/api",
  httpsAgent: {
    rejectUnauthorized: false, // Only for development with self-signed certs
  },
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("Request:", config.method?.toUpperCase(), config.url);
  console.log("Payload:", config.data);

  return config;
});

client.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.log("Error Status:", error.response?.status);
    console.log("Error Data:", error.response?.data);
    return Promise.reject(error);
  }
);

export default client;