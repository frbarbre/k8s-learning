import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Link, redirect, useSubmit } from "react-router";
import { login } from "../lib/auth";

type SignInFormData = {
  email: string;
  password: string;
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const object = Object.fromEntries(formData);

  const response = await fetch(process.env.API_URL + "/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });

  const data = await response.json();

  if (data?.token) {
    return await login(data);
  }

  return redirect("/sign-in?error=Invalid credentials");
};

export default function SignIn() {
  const submit = useSubmit();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();
  const [error, setError] = useState<string | null>(
    // Get error from URL query parameter
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null
  );

  const onSubmit = async (data: SignInFormData) => {
    try {
      // Submit the form data to the action
      submit(data, { method: "post" });
    } catch (err) {
      setError("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Please sign in to your account</p>

        <Form
          onSubmit={handleSubmit(onSubmit)}
          method="post"
          className="auth-form"
        >
          {error && <div className="auth-error">{error}</div>}

          <div>
            <label htmlFor="email" className="auth-label">
              Email address
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              id="email"
            />
            {errors.email && (
              <p className="auth-input-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type="password"
              id="password"
            />
            {errors.password && (
              <p className="auth-input-error">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="auth-submit">
            Sign in
          </button>

          <p className="auth-subtitle">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
