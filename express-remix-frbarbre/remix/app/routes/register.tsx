import { login } from "../lib/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Link, redirect, useSubmit } from "react-router";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const object = Object.fromEntries(formData);

  const response = await fetch(process.env.API_URL + "/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });

  const data = await response.json();

  console.log(data);

  if (data?.token) {
    return await login(data);
  }

  return redirect("/register?error=Registration failed");
};

export default function Register() {
  const submit = useSubmit();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const [error, setError] = useState<string | null>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null
  );

  const onSubmit = async (data: RegisterFormData) => {
    try {
      submit(data, { method: "post" });
    } catch (err) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Please fill in your details to register</p>

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

          <div>
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val: string) => {
                  if (watch("password") != val) {
                    return "Passwords do not match";
                  }
                },
              })}
              type="password"
              id="confirmPassword"
            />
            {errors.confirmPassword && (
              <p className="auth-input-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button type="submit" className="auth-submit">
            Register
          </button>

          <p className="auth-subtitle">
            Already have an account?{" "}
            <Link to="/sign-in" className="auth-link">
              Sign in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
