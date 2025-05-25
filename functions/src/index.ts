
import * as functions from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as bcrypt from "bcrypt";

admin.initializeApp();
const db = admin.firestore();
const SALT_ROUNDS = 10; // bcrypt salt rounds

/**
 * Generates a random alphanumeric access code.
 * @returns {string} A 6-character uppercase alphanumeric code.
 */
const generatePlaintextAccessCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Firebase Authentication trigger that fires when a new user is created.
 * Creates a corresponding user profile in Firestore with a hashed mechanic
 * access code.
 */
export const createUserProfileOnSignUp = functions.auth.user().onCreate(
  async (user) => {
    logger.info(`New user signed up: ${user.uid}, email: ${user.email}`);
    if (!user.email) {
      logger.error(
        "User email is missing, cannot create user profile.",
        {uid: user.uid}
      );
      return;
    }

    const plaintextAccessCode = generatePlaintextAccessCode();
    try {
      const hashedMechanicAccessCode = await bcrypt.hash(
        plaintextAccessCode,
        SALT_ROUNDS
      );

      const userProfile = {
        userId: user.uid,
        email: user.email,
        hashedMechanicAccessCode: hashedMechanicAccessCode,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // You can return the plaintext code in the function logs for initial
        // setup/testing but it should NOT be stored in Firestore or returned
        // to the client from this trigger.
        // An owner would get their code through a separate, secure
        // client-callable function.
      };

      await db.collection("userProfiles").doc(user.uid).set(userProfile);
      logger.info(
        `User profile created for ${user.uid} with hashed access code. ` +
        `Plaintext for initial sharing (DEV ONLY): ${plaintextAccessCode}`
      );
      // IMPORTANT: For production, the owner needs a way to securely retrieve
      // this plaintext code ONCE. This could be a separate callable function
      // they invoke after signup.
    } catch (error) {
      logger.error(
        `Error creating user profile for ${user.uid}:`,
        error
      );
      // Optionally, you could send the plaintext code to the user via email
      // here, but that adds email service dependencies.
    }
  }
);


/**
 * HTTP Callable function for mechanics to validate access to an owner's data.
 */
export const validateMechanicAccess = functions.https.onCall(
  async (data, _context) => { // _context is unused for now
    const {ownerEmail, accessCode} = data;

    if (!ownerEmail || !accessCode) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Owner email and access code are required."
      );
    }

    logger.info(`Mechanic validation attempt for owner: ${ownerEmail}`);

    try {
      const profileQuery = await db.collection("userProfiles")
        .where("email", "==", ownerEmail)
        .limit(1)
        .get();

      if (profileQuery.empty) {
        logger.warn(`No user profile found for email: ${ownerEmail}`);
        return {success: false, error: "Invalid owner email or access code."};
      }

      const userProfileDoc = profileQuery.docs[0];
      const userProfile = userProfileDoc.data();

      if (!userProfile.hashedMechanicAccessCode) {
        logger.error(
          `User profile for ${ownerEmail} is missing a hashed access code.`
        );
        return {success: false, error: "Access code not set up for this owner."};
      }

      const isMatch = await bcrypt.compare(
        accessCode,
        userProfile.hashedMechanicAccessCode
      );

      if (isMatch) {
        logger.info(
          `Mechanic access GRANTED for owner: ${ownerEmail} ` +
          `(User ID: ${userProfile.userId})`
        );
        return {
          success: true,
          ownerEmail: userProfile.email,
          ownerUserId: userProfile.userId,
        };
      } else {
        logger.warn(
          `Mechanic access DENIED for owner: ${ownerEmail}. ` +
          "Invalid access code."
        );
        return {success: false, error: "Invalid owner email or access code."};
      }
    } catch (error) {
      logger.error("Error during mechanic access validation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "An internal error occurred during validation."
      );
    }
  }
);

/**
 * HTTP Callable function for an authenticated car owner to regenerate
 * their mechanic access code.
 */
export const regenerateMechanicAccessCode = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to regenerate access code."
      );
    }
    const userId = context.auth.uid;
    logger.info(
      `User ${userId} requesting to regenerate mechanic access code.`
    );

    const plaintextAccessCode = generatePlaintextAccessCode();
    try {
      const hashedMechanicAccessCode = await bcrypt.hash(
        plaintextAccessCode,
        SALT_ROUNDS
      );

      await db.collection("userProfiles").doc(userId).update({
        hashedMechanicAccessCode: hashedMechanicAccessCode,
        accessCodeLastGeneratedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(`Mechanic access code regenerated for user ${userId}.`);
      // Return the new PLAINTEXT code to the authenticated owner ONCE.
      return {success: true, newAccessCode: plaintextAccessCode};
    } catch (error) {
      logger.error(
        `Error regenerating access code for user ${userId}:`,
        error
      );
      throw new functions.https.HttpsError(
        "internal",
        "Failed to regenerate access code."
      );
    }
  }
);
