const BACKEND_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:3000"
  : "https://serene-dedication.up.railway.app";

export default BACKEND_URL;
