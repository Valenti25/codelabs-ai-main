import axios from "axios";

const baseURL =
  (typeof window === "undefined"
    ? process.env.API_URL
    : process.env.NEXT_PUBLIC_API_URL) ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";
export type ContactFormMode = "appointment" | "message";
export type ContactServiceId = "sales" | "support" | "partnership" | "general";

export interface ContactLeadPayload {
  formType?: ContactFormMode;
  service: ContactServiceId;

  name: string;
  company?: string | null;
  email: string;
  phone?: string;
  message: string;
  timezone?: string;
  source?: string;
  date?: string | Date | null;
  time?: string | null;
}

export interface ContactLeadResponse {
  message: "created";
  id: number;
  mode: "appointment" | "message";
  saved: {
    callback_date: string | null;
    callback_time_start: string | null;
    callback_time_end: string | null;
  };
}

export async function submitContactLead(payload: ContactLeadPayload) {
  const url = `${baseURL}/contact`;
  console.log("submitContactLead URL =", url, "payload =", payload);

  const { data } = await axios.post(url, payload, {
    headers: { "Cache-Control": "no-store" },
    timeout: 15000,
  });

  console.log("submitContactLead response =", data);
  return data as ContactLeadResponse;
}
