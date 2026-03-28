import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: { email: "", password: "" },

    validationSchema: Yup.object({
      email: Yup.string().email("Enter valid email").required("Email required"),
      password: Yup.string()
        .min(6, "Min 6 chars")
        .required("Password required"),
    }),

    onSubmit: (values, { setSubmitting }) => {
      setError("");

      api
        .post("/company/login", values)
        .then((res) => {
          localStorage.setItem("companyName", res.data.companyName);
          navigate("/dashboard");
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Invalid email or password");
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm ${
      formik.touched[field] && formik.errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">
          Log in to your company account
        </p>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputClass("password")}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500">{formik.errors.password}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="bg-orange-500 text-white py-3 rounded-xl"
          >
            {formik.isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-orange-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
