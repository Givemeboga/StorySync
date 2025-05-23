import { clsx, type ClassValue } from "clsx";
import { getCookie } from "cookies-next";
import { twMerge } from "tailwind-merge";

import type {
  AccessToken,
  RefreshToken,
  UserStruct,
} from "@/types/authInterfaces";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const parseCookie = async <T>(
  cookieName: string,
): Promise<SafeParseResult<T>> => {
  try {
    const cookieValue = (await getCookie(cookieName)) ?? "";

    if (!cookieValue) {
      return {
        success: false,
        error: `Cookie ${cookieName} not found`,
      };
    }

    return {
      success: true,
      data: JSON.parse(cookieValue) as T,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to parse ${cookieName} cookie: ${errorMessage}`,
    };
  }
};

const getToken = async (
  cookieName: "access" | "refresh",
  tokenField: keyof AccessToken | keyof RefreshToken,
): Promise<string | undefined> => {
  const result =
    cookieName === "access"
      ? await parseCookie<AccessToken>(cookieName)
      : await parseCookie<RefreshToken>(cookieName);

  if (!result.success) {
    console.warn(`Failed to parse ${cookieName} token: ${result.error}`);
    return undefined;
  }

  const token = result.data[tokenField as keyof typeof result.data] as string;
  return typeof token === "string" ? token.trim() : undefined;
};

const getAccessToken = async (): Promise<string | undefined> =>
  getToken("access", "access_token");
const getRefreshToken = async (): Promise<string | undefined> =>
  getToken("refresh", "refresh_token");

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAccessToken();
  if (!token) {
    return {};
  }
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
};

export const getRefreshHeaders = async (): Promise<HeadersInit> => {
  const token = await getRefreshToken();
  if (!token) {
    return {};
  }
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  return headers;
};

export const formatDate = (
  dateInput: string | Date | null | undefined,
): string => {
  const fallback = "N/A";
  if (!dateInput) return fallback;

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (!Number.isFinite(date.getTime())) return fallback;

  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Date formatting failed: ${errorMessage}`);
    return fallback;
  }
};

export const getUserId = async (): Promise<string | undefined> => {
  const result = await parseCookie<UserStruct>("user");
  if (!result.success) {
    return undefined;
  }

  const userId = result.data.id?.trim();
  return userId?.length ? userId : undefined;
};

export function calculateEighteenYearsAgo(): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date;
}

export async function readFileAsBase64(filePath: string): Promise<string> {
  const response = await fetch(filePath);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
