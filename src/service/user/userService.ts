import { User } from "./userType";
import AppError from "../../utils/appError.js";
const bcrypt = require("bcrypt");
const util = require("../../utils/utils.js");
const userRepo = require("./userRepo");

const getUserByEmail = async (emailAddress: string) => {
  if (!emailAddress) throw new AppError("Email address is required", 400);

  return await userRepo.findUser(null, emailAddress.toLowerCase())
    .then(user => user)
    .catch(err => {throw new AppError(err, 400)});
};

// Returns user without password (for internal use)
const getUserById = async (userId: number) => {
  if (!userId)  throw AppError("user_id is required", 400);
  const user = (await userRepo.findUser(userId, null));

  if (user.length === 0) {
    throw new AppError("User not found with that Id", 404);
  }
  return user;
};
// Returns user
const getUserByVerificationToken = async (token: string) => {
  if (!token) throw new AppError("Verification token is required", 400);
  const foundUser = await userRepo.findUserByVerificationToken(token)
    .then((user) => {
      if (!user) {
        throw new AppError("No user found with that verification token", 400);
      }
      return user;
    })
    .catch((err) => {
      throw new AppError(err, 400);
    });
  return foundUser;
};

const getUserByResetToken = (resetToken: string): User => {
  if (!resetToken) throw new AppError("reset_token is required", 400);
  const user = userRepo.findUserByResetToken(resetToken);

  if (!user) throw new AppError("User not found", 404);
  return user;
};

const createUser = async (user: User) => {
  try {
    _validate_user_profile_completeness(user)
    const found = await getUserByEmail(user.email_address);
    if (!found) {
      return await userRepo.addUser(user);
    }
    throw new AppError("User already exist", 400);
  } catch (e: any) {
    throw e;
  }
};
const updateUserProfile = async (user: User) => {
  // TODO: Implement this
  try {
    await getUserById(user.id); 
    _validate_user_profile_completeness(user)
  }
  catch (e) {
    throw e
  }
  return userRepo.updateUser(user);
};
const updateResetToken = async (emailAddress, resetToken, resetTokenExpiry) => {
  try {
    const user = await getUserByEmail(emailAddress);
    if (!user) throw AppError('User not found with that email address', 404)
    user.password_reset_token = resetToken;
    user.password_reset_expires_in = resetTokenExpiry;

    return userRepo.updateUser(user);
  } catch (err) {
    throw err;
  }
};

const updatePassword = async (
  userId,
  emailAddress,
  newPassword,
  newPasswordConfirm
) => {
  const user = await getUserByEmail(emailAddress);
  if (!user) throw AppError("No user found", 404);
  if (userId !== user.id) throw AppError("User not allowed", 403);
  if (newPassword !== newPasswordConfirm) {
    throw AppError("Passwords do not match", 400);
  }
  user.password = await bcrypt.hash(newPassword, 10);
  user.password_reset_token = "";
  user.password_reset_expires_in = 0;
  user.password_last_updated = Date.now();
  const found = userRepo.updateUser(user);
  if (found) userRepo.clearRefreshTokens(userId);
  return found;
};

const verifyUser = async (token: string) => {
  try {
    if (!token) throw new Error("Verification token is required");
    const user: User = await getUserByVerificationToken(token);
    // TODO: Send error with error code
    // if (user.is_verified) throw new Error('User is already verified')
    // if (user.verify_expires && user.verify_expires.toDateString() > Date.now().toString()) throw new Error('Verification token expired')

    user.is_verified = true;
    return userRepo.updateUser(user);
  } catch (e) {
    throw e;
  }
};

const deleteUser = async (userId: number) => {
  try {
    const user = await getUserById(userId);
    user.deleted_date = Date.now();
    return await userRepo.updateUser(user);
  } catch (e) {
    throw e;
  }
};

const setAciveStatus = async (userId, active) => {
  try {
    const user = await getUserById(userId);
    user.active = active;
    return await userRepo.updateUser(user);
  } catch (e) {
    throw e;
  }
};

const storeRefreshToken = async (userId: number, refreshToken: string) => {
  if (!refreshToken) throw new AppError("refresh_token is required", 400);
  return await userRepo.storeRefreshToken(userId, refreshToken);
};

const findRefreshToken = async (userId: number, refreshToken: string) => {
  return await userRepo.findRefreshToken(userId, refreshToken);
};

const _validate_user_profile_completeness = (user) => {
  if (!user.email_address) throw new AppError("Email address is required", 400);
  if (!user.password) throw new AppError("Password is required", 400);
  if (!user.first_name) throw new AppError("First name is required", 400)
  if (!user.last_name) throw new AppError("Last name is required", 400)
  if (!user.gender) throw new AppError("Gender is required", 400)
  if (!user.dob) throw new AppError("Date of birth is required", 400)

  return true
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updateResetToken,
  updatePassword,
  getUserByResetToken,
  deleteUser,
  updateUserProfile,
  verifyUser,
  setAciveStatus,
  storeRefreshToken,
  findRefreshToken,
};
