import axios from "axios";

const api = axios.create({
  baseURL: "https://api.newslettercam.me",
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
