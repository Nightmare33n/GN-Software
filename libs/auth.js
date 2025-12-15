import { getServerSession } from "next-auth";
import { authOptions } from "./next-auth";
import User from "@/models/User";
import connectMongo from "./mongoose";

/**
 * Get the currently authenticated user from the session
 * @throws {Error} if user is not authenticated or not found
 * @returns {Promise<User>} the authenticated user document
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Unauthorized - Please sign in');
  }

  await connectMongo();
  const user = await User.findById(session.user.id);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Require that the current user is a freelancer or admin
 * @throws {Error} if user is not a freelancer/admin
 * @returns {Promise<User>} the authenticated freelancer/admin user
 */
export async function requireFreelancer() {
  const user = await getAuthenticatedUser();

  if (!user.canCreateGigs()) {
    throw new Error('Freelancer or admin access required');
  }

  return user;
}

/**
 * Require that the current user is an admin
 * @throws {Error} if user is not an admin
 * @returns {Promise<User>} the authenticated admin user
 */
export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

/**
 * Check if a user is a freelancer or admin (can create gigs)
 * @param {User} user - The user document
 * @returns {boolean}
 */
export function isFreelancer(user) {
  return user && (user.role === 'freelancer' || user.role === 'admin');
}

/**
 * Check if a user is an admin
 * @param {User} user - The user document
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user && user.role === 'admin';
}

/**
 * Check if a user is a client
 * @param {User} user - The user document
 * @returns {boolean}
 */
export function isClient(user) {
  return user && user.role === 'client';
}
