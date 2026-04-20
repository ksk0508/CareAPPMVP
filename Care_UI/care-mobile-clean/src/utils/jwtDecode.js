/**
 * Decode JWT token and extract claims
 * Handles both simple claim names and .NET ClaimTypes full URIs
 */
export const decodeJWT = (token) => {
  try {
    if (!token) {
      console.log("❌ decodeJWT: No token provided");
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("❌ decodeJWT: Invalid token format");
      return null;
    }

    const decoded = JSON.parse(atob(parts[1]));
    console.log("📋 JWT Payload:", decoded);

    // Map common claim types to readable names
    const claimMap = {
      "sub": "id",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "id",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier": "id",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "email",
      "email": "email",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role": "role",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "role",
      "role": "role",
      "roles": "role",
      "PatientId": "patientId",
      "PractitionerId": "practitionerId",
    };

    // Create a cleaner object
    const user = {};
    Object.keys(decoded).forEach((key) => {
      // If this is a known claim type, map it to a simpler name
      if (claimMap[key]) {
        user[claimMap[key]] = decoded[key];
      } else {
        // Otherwise keep the original key
        user[key] = decoded[key];
      }
    });

    console.log("✅ Decoded user:", user);
    return user;
  } catch (error) {
    console.log("❌ JWT decode error:", error);
    return null;
  }
};
