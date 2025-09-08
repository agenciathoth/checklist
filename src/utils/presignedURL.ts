import { CreatePresignedURLSchema } from "@/validators/upload";
import axios from "axios";

type GetPresignedURL = {
  url: string;
  type: string;
  path: string;
};

export const getPresignedURL = async (body: CreatePresignedURLSchema) => {
  const { data } = await axios.post<GetPresignedURL>(
    "https://jhze5o4c2igo5gvsvcqvw7tj4y0webdo.lambda-url.us-east-2.on.aws/",
    body
  );

  return data;
};
