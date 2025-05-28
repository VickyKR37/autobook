
// This directive was for Next.js server components, not Cloud Functions.
// It was removed as it's not applicable here.

import * as admin from "firebase-admin";
import * as bcrypt from "bcrypt";
// Standard import for Firebase Functions v1 SDK.
// If TypeScript reports that 'functions.region' does not exist and that
// 'functions' is typed as the v2 module, it indicates an environment-specific
// module resolution issue, as firebase-functions@6.x.x default export
// should point to v1 types.
import * as functions from "firebase-functions/v1";
import type {UserRecord} from "firebase-admin/auth";
import type {
  HttpsError,
  CallableContext,
} from "firebase-functions/v1/https";

admin.initializeApp();

const db = admin.firestore();
const SALT_ROUNDS = 10;

/**
 * Generates a random 6-character uppercase alphanumeric string.
 * @return {string} The generated access code.
 */
const generatePlaintextAccessCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

interface UserProfile {
  userId: string;
  email: string;
  hashedMechanicAccessCode: string;
  createdAt: admin.firestore.FieldValue; // For server timestamp
  accessCodeLastGeneratedAt?: admin.firestore.FieldValue;
}

// This function uses the v1 SDK syntax.
export const createUserProfileOnSignUp = functions
  .region("europe-west1")
  .auth.user()
  .onCreate(async (user: UserRecord): Promise<void> => {
    functions.logger.info(
      `New user signed up: ${user.uid}, email: ${user.email}`,
    );

    if (!user.email) {
      functions.logger.error(
        "User email is missing, cannot create user profile.",
        {uid: user.uid},
      );
      return;
    }

    const plaintextAccessCode = generatePlaintextAccessCode();

    try {
      const hashedMechanicAccessCode = await bcrypt.hash(
        plaintextAccessCode,
        SALT_ROUNDS,
      );

      const userProfileData: Omit<UserProfile, "createdAt"> = {
        userId: user.uid,
        email: user.email,
        hashedMechanicAccessCode,
      };

      await db
        .collection("userProfiles")
        .doc(user.uid)
        .set({
          ...userProfileData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      functions.logger.info(`User profile created for ${user.uid}`);
      // This log is for development/debugging only.
      // In production, plaintext codes should not be logged.
      functions.logger.info(
        `DEV ONLY - Plaintext code for ${user.uid}: ${plaintextAccessCode}`,
      );
    } catch (error) {
      functions.logger.error(
        `Error creating user profile for ${user.uid}:`,
        error,
      );
    }
  });

interface ValidateMechanicAccessData {
  ownerEmail: string;
  accessCode: string;
}

interface ValidateMechanicAccessResult {
  success: boolean;
  ownerEmail?: string;
  ownerUserId?: string;
  error?: string;
}

// This function uses the v1 SDK syntax.
export const validateMechanicAccess = functions
  .region("europe-west1")
  .https.onCall(
    async (
      data: ValidateMechanicAccessData,
      _context: CallableContext, // _context is from v1 onCall
    ): Promise<ValidateMechanicAccessResult> => {
      const {ownerEmail, accessCode} = data;

      if (!ownerEmail || !accessCode) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Owner email and access code are required.",
        );
      }

      functions.logger.info(
        `Mechanic validation attempt for owner: ${ownerEmail}`,
      );

      try {
        const profileQuery = await db
          .collection("userProfiles")
          .where("email", "==", ownerEmail)
          .limit(1)
          .get();

        if (profileQuery.empty) {
          functions.logger.warn(
            `No user profile found for email: ${ownerEmail}`,
          );
          return {
            success: false,
            error: "Invalid owner email or access code.",
          };
        }

        const userProfileDoc = profileQuery.docs[0];
        const userProfile = userProfileDoc.data() as UserProfile;

        if (!userProfile.hashedMechanicAccessCode) {
          functions.logger.error(
            `User profile for ${ownerEmail} missing hashed access code.`,
          );
          return {
            success: false,
            error: "Access code not set up for this owner.",
          };
        }

        const isMatch = await bcrypt.compare(
          accessCode,
          userProfile.hashedMechanicAccessCode,
        );

        if (isMatch) {
          functions.logger.info(
            `Mechanic access GRANTED for owner: ${ownerEmail} ` +
            `(User ID: ${userProfile.userId})`,
          );
          return {
            success: true,
            ownerEmail: userProfile.email,
            ownerUserId: userProfile.userId,
          };
        } else {
          functions.logger.warn(
            `Mechanic access DENIED for owner: ${ownerEmail}. Invalid code.`,
          );
          return {
            success: false,
            error: "Invalid owner email or access code.",
          };
        }
      } catch (error) {
        functions.logger.error(
          "Error during mechanic access validation:",
          error,
        );
        const httpsError = error as HttpsError; // Cast to v1 HttpsError
        throw new functions.https.HttpsError(
          httpsError.code || "internal",
          httpsError.message || "An internal error occurred.",
        );
      }
    },
  );

interface RegenerateCodeResult {
  success: boolean;
  newAccessCode?: string;
  error?: string;
}

// This function uses the v1 SDK syntax.
export const regenerateMechanicAccessCode = functions
  .region("europe-west1")
  .https.onCall(
    async (
      _data: unknown, // Data is not used by this function for v1
      context: CallableContext, // context is from v1 onCall
    ): Promise<RegenerateCodeResult> => {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated to regenerate access code.",
        );
      }

      const userId = context.auth.uid;
      functions.logger.info(
        `User ${userId} requesting to regenerate mechanic access code.`,
      );

      const plaintextAccessCode = generatePlaintextAccessCode();

      try {
        const hashedMechanicAccessCode = await bcrypt.hash(
          plaintextAccessCode,
          SALT_ROUNDS,
        );

        await db.collection("userProfiles").doc(userId).update({
          hashedMechanicAccessCode,
          accessCodeLastGeneratedAt:
            admin.firestore.FieldValue.serverTimestamp(),
        });

        // This log is for development/debugging only.
        // In production, plaintext codes should not be logged.
        functions.logger.info(
          `Mechanic access code regenerated for user ${userId}. ` +
          `New plaintext code (DEV ONLY): ${plaintextAccessCode}`,
        );

        return {
          success: true,
          newAccessCode: plaintextAccessCode,
        };
      } catch (error) {
        functions.logger.error(
          `Error regenerating code for user ${userId}:`,
          error,
        );
        const httpsError = error as HttpsError; // Cast to v1 HttpsError
        throw new functions.https.HttpsError(
          httpsError.code || "internal",
          httpsError.message || "Failed to regenerate access code.",
        );
      }
    },
  );
