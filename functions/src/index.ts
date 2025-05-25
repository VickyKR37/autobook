
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
// AdminUserRecord was unused, UserCreatedEvent (if resolved) types event.data
// import type { UserRecord as AdminUserRecord } from "firebase-admin/auth";
import * as bcrypt from "bcrypt";

import {
  HttpsError,
  CallableRequest,
  onCall,
} from "firebase-functions/v2/https";

import { setGlobalOptions } from "firebase-functions/v2";
import {
  onUserCreated,
  type UserCreatedEvent, // 'type' keyword ensures it's a type import
} from "firebase-functions/v2/identity";

setGlobalOptions({ region: "europe-west1" });

admin.initializeApp();
const db = admin.firestore();
const SALT_ROUNDS = 10; // bcrypt salt rounds

/**
 * Generates a random plaintext access code.
 * @return {string} The generated access code.
 */
const generatePlaintextAccessCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createUserProfileOnSignUp = onUserCreated(
  async (event: UserCreatedEvent): Promise<void> => {
    const user = event.data; // User data is in event.data for v2 identity triggers
    logger.info(
      `New user signed up: ${user.uid}, email: ${user.email}`,
    );

    if (!user.email) {
      logger.error(
        "User email is missing, cannot create user profile.",
        { uid: user.uid },
      );
      return;
    }

    const plaintextAccessCode = generatePlaintextAccessCode();
    try {
      const hashedMechanicAccessCode = await bcrypt.hash(
        plaintextAccessCode,
        SALT_ROUNDS,
      );

      const userProfile = {
        userId: user.uid,
        email: user.email,
        hashedMechanicAccessCode: hashedMechanicAccessCode,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db
        .collection("userProfiles")
        .doc(user.uid)
        .set(userProfile);

      logger.info(
        `User profile created for ${user.uid} with hashed access code.`,
      );
      // This log is for development purposes only.
      // Ensure it's removed or appropriately handled in production.
      logger.info(
        `DEV ONLY - Plaintext code for ${user.uid}: ${plaintextAccessCode}`,
      );
    } catch (error) {
      logger.error(
        `Error creating user profile for ${user.uid}:`,
        error,
      );
    }
  },
);

export const validateMechanicAccess = onCall(
  async (
    request: CallableRequest<{ ownerEmail: string; accessCode: string }>,
  ): Promise<{
    success: boolean;
    ownerEmail?: string;
    ownerUserId?: string;
    error?: string;
  }> => {
    const { ownerEmail, accessCode } = request.data;

    if (!ownerEmail || !accessCode) {
      throw new HttpsError(
        "invalid-argument",
        "Owner email and access code are required.",
      );
    }

    logger.info(
      `Mechanic validation attempt for owner: ${ownerEmail}`,
    );

    try {
      const profileQuery = await db
        .collection("userProfiles")
        .where("email", "==", ownerEmail)
        .limit(1)
        .get();

      if (profileQuery.empty) {
        logger.warn(`No user profile found for email: ${ownerEmail}`);
        return {
          success: false,
          error: "Invalid owner email or access code.",
        };
      }

      const userProfileDoc = profileQuery.docs[0];
      const userProfile = userProfileDoc.data() as any;

      if (!userProfile.hashedMechanicAccessCode) {
        logger.error(
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
        logger.info(
          `Mechanic access GRANTED for owner: ${ownerEmail} ` +
          `(User ID: ${userProfile.userId})`,
        );
        return {
          success: true,
          ownerEmail: userProfile.email,
          ownerUserId: userProfile.userId,
        };
      } else {
        logger.warn(
          `Mechanic access DENIED for owner: ${ownerEmail}. Invalid code.`,
        );
        return {
          success: false,
          error: "Invalid owner email or access code.",
        };
      }
    } catch (error) {
      logger.error(
        "Error during mechanic access validation:",
        error,
      );
      throw new HttpsError(
        "internal",
        "An internal error occurred during validation.",
      );
    }
  },
);

export const regenerateMechanicAccessCode = onCall(
  async (
    request: CallableRequest<unknown>,
  ): Promise<{
    success: boolean;
    newAccessCode?: string;
    error?: string;
  }> => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to regenerate access code.",
      );
    }

    const userId = request.auth.uid;
    logger.info(
      `User ${userId} requesting to regenerate mechanic access code.`,
    );

    const plaintextAccessCode = generatePlaintextAccessCode();
    try {
      const hashedMechanicAccessCode = await bcrypt.hash(
        plaintextAccessCode,
        SALT_ROUNDS,
      );

      await db.collection("userProfiles").doc(userId).update({
        hashedMechanicAccessCode: hashedMechanicAccessCode,
        accessCodeLastGeneratedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info(
        `Mechanic access code regenerated for user ${userId}. ` +
        `New plaintext code (DEV ONLY): ${plaintextAccessCode}`,
      );
      return {
        success: true,
        newAccessCode: plaintextAccessCode,
      };
    } catch (error) {
      logger.error(
        `Error regenerating code for user ${userId}:`,
        error,
      );
      throw new HttpsError(
        "internal",
        "Failed to regenerate access code.",
      );
    }
  },
);
