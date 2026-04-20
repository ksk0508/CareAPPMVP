import client from "./client";

export const setNotificationPreferences = (preferences) =>
  client.post("/notifications/preferences", preferences);

export const getNotificationPreferences = () =>
  client.get("/notifications/preferences");

export const enableDisableNotifications = (enabled) =>
  client.post("/notifications/enable-disable", { enable: enabled });

export const getNotificationHistory = () =>
  client.get("/notifications/history");
