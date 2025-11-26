//app/login/action.js
"use server";

import createClient from "@/lib/server";
import { redirect } from "next/navigation";

export default async function handleLogin(formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  // Server-side validation
  const errors = {};

  // Email validation
  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.password = "Password must contain at least one lowercase letter";
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.password = "Password must contain at least one uppercase letter";
  } else if (!/(?=.*\d)/.test(password)) {
    errors.password = "Password must contain at least one number";
  } else if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.password =
      "Password must contain at least one special character (@$!%*?&)";
  }

  // If there are validation errors
  if (Object.keys(errors).length > 0) {
    const errorMessage = Object.values(errors)[0];
    redirect(`/signin?error=${encodeURIComponent(errorMessage)}`);
  }

  try {
    // ✅ CORRECT: Use signInWithPassword for email/password login
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Better error messages
      let userFriendlyError = "Invalid credentials, please try again.";
      if (error.message.includes("Invalid login credentials")) {
        userFriendlyError = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        userFriendlyError = "Please verify your email first";
      }

      redirect(`/signin?error=${encodeURIComponent(userFriendlyError)}`);
    }
  } catch (error) {
    redirect(
      `/signin?error=${encodeURIComponent(
        "Something went wrong. Please try again."
      )}`
    );
  }
  return;
}
