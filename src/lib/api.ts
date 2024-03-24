import { env } from "@/config/env";
import axios from "axios";

export const api = axios.create({
  baseURL: (process.env.NODE_ENV === "production"
    ? "https://checklist-next.vercel.app/"
    : "http://localhost:3000/"
  ).concat("api/"),
});
