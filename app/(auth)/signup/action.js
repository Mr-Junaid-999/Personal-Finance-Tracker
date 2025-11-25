"use server";

import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function handleSignup(formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("tel")?.toString().trim();
  const password = formData.get("password")?.toString();
  const birthdate = formData.get("birthdate")?.toString();
  const gender = formData.get("gender")?.toString();

  // Server-side validation - Collect all errors
  const errors = {};

  // Full Name validation
  if (!name) {
    errors.name = "Full name is required";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (!/^[a-zA-Z\s]{2,50}$/.test(name)) {
    errors.name = "Name can only contain letters and spaces";
  }

  // Gender validation
  if (!gender) {
    errors.gender = "Gender is required";
  }

  // Birthdate validation
  if (!birthdate) {
    errors.birthdate = "Birthdate is required";
  } else if (birthdate > new Date().toISOString().split("T")[0]) {
    errors.birthdate = "Please enter a valid birthdate";
  }

  // Email validation
  if (!email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  // Phone validation
  if (phone && !/^\+?[\d\s-()]{10,15}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number";
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

  // If there are validation errors, redirect with error message
  if (Object.keys(errors).length > 0) {
    const errorMessage = Object.values(errors)[0]; // Pehla error message
    redirect(`/signup?error=${encodeURIComponent(errorMessage)}`);
  }

  try {
    // Supabase signup
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          phone: phone || null,
          birthdate: birthdate,
          gender: gender,
        },
      },
    });

    if (error) {
      // Redirect with Supabase error
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }
    console.log("Auth Data:", authData.user);
    console.log(
      "User ID:",
      authData.user.id,
      "Email:",
      email,
      "Name:",
      name,
      " Phone:",
      phone,
      "Birthdate:",
      birthdate,
      "Gender:",
      gender
    );

    if (authData.user) {
      const { data, error } = await supabase.from("users").insert({
        user_id: authData.user.id,
        email: email,
        name: name,
        phone: phone,
        birthdate: birthdate,
        gender: gender,
        role: "customer",
      });
      if (error) {
        console.log("Error inserting user data:", error);
        // Redirect with Supabase error
        redirect(`/signup?error=${encodeURIComponent(error.message)}`);
      } else {
        // Success - redirect to verification page with success message
        redirect(`/login`);
      }
    }
  } catch (error) {
    // Redirect with generic error
    redirect(
      `/signup?error=${encodeURIComponent(
        "Something went wrong. Please try again."
      )}`
    );
  }
  // Success - redirect to verification page with success message
  return;
}
