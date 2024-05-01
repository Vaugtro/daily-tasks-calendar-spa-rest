import axios from "axios";

const defaultApi = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:8080",
});

// Add a response interceptor to set the `Authorization` header using the `Authorization` header from the response.
defaultApi.interceptors.response.use(
  (response) => {
    // If the response has an `Authorization` header, set a flag in the local storage to indicate that the user is signed in.
    localStorage.setItem("signed", response.headers.hasAuthorization ? "true" : "false");
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
)

export default defaultApi;
