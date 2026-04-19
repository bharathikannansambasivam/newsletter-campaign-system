import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../services/api";
import BackButton from "../components/BackButton";

const validationSchema = Yup.object({
  companyName: Yup.string().required("Company name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[a-zA-Z]/, "Must contain at least one letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .required("Password is required"),
});

export default function Signup() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { companyName: "", email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      console.log("Signup form values:", values);
      setStatus(null);
      try {
        await api.post("/company/signup", values);
        navigate("/login");
      } catch (err) {
        setStatus(
          err.response?.data?.message || "Signup failed. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-colors ${
      formik.touched[field] && formik.errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton to="/" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Create an account
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Sign up to start sending campaigns
          </p>

          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Acme Inc."
                className={inputClass("companyName")}
              />
              {formik.touched.companyName && formik.errors.companyName && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.companyName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="you@company.com"
                className={inputClass("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="••••••••"
                className={inputClass("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Server error */}
            {formik.status && (
              <p className="text-sm text-red-500">{formik.status}</p>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              {formik.isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-500 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
