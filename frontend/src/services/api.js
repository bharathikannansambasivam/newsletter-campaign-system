import axios from "axios";

const api = axios.create({
  baseURL: "https://newsletter-campaign-system-1.onrender.com",
  withCredentials: true,
});

// Redirect to login on 401 (expired or missing token)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("companyName");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
