sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Hash a given password using SHA-256.
     * @param {string} password - The password to hash.
     * @returns {Promise<string>} - The hashed password as a hex string.
     */
    hashPassword: async function (password) {
      // Convert the password string to an ArrayBuffer
      const encoder = new TextEncoder();
      const data = encoder.encode(password);

      // Perform the SHA-256 hash
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);

      // Convert the ArrayBuffer to a hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      return hashHex; // 64-character hex string
    },
  };
});
