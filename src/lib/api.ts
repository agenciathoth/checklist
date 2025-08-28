import axios from "axios";

export const api = axios.create({
  baseURL: (process.env.NODE_ENV === "production"
    ? "https://thoth.social/"
    : "http://localhost:3000/"
  ).concat("api/"),
});
