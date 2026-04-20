import axios from "axios";

const api = axios.create({
  baseURL: "https://api.newslettercam.me",

  // "http://localhost:5000"
  withCredentials: true,
});

// Redirect to login on 401 (expired or missing token)

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        await axios.post(
          "http://localhost:5000/company/refresh",
          {},
          { withCredentials: true }
        );

        return api(err.config);
      } catch (refreshError) {
        localStorage.removeItem("companyName");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
