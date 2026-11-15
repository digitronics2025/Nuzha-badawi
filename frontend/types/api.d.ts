export type Locale = "uk" | "en" | "ar" | "ru";
export type EnquiryType =
  "lesson" | "coaching" | "translation" | "interpretation";
export type AdminRole = "owner" | "editor";
export type EnquiryStatus =
  | "new"
  | "reviewing"
  | "awaiting_customer"
  | "quoted"
  | "booked"
  | "completed"
  | "closed"
  | "spam";
export type LanguageCode = "en" | "ar" | "ru" | "uk";
export interface EnquiryRequest {
  idempotencyKey: string;
  locale: Locale;
  type: EnquiryType;
  name: string;
  email: string;
  message: string;
  details: {
    language?: "english" | "russian" | "arabic";
    goal?: string;
    sourceLanguage?: LanguageCode;
    targetLanguage?: LanguageCode;
    dueDate?: string;
    eventDate?: string;
    format?: "remote" | "in_person" | "unsure";
  };
  privacyAcknowledged: boolean;
  turnstileToken?: string;
}
export interface EnquiryAccepted {
  ok: true;
  reference: string;
  acceptedAt: string;
  notificationStatus: "pending" | "sent" | "failed";
}
export interface ApiError {
  ok: false;
  code:
    | "VALIDATION_FAILED"
    | "BOT_CHECK_FAILED"
    | "RATE_LIMITED"
    | "SERVICE_UNAVAILABLE"
    | "INTERNAL_ERROR";
  message: string;
  fieldErrors?: Record<string, string>;
  retryAfterSeconds?: number;
}
export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  expiresAt: string;
}
export interface ContentLocale {
  locale: Locale;
  title: string;
  description: string;
  status: "draft" | "needs_review" | "ready" | "published";
  revision: number;
}
export interface ContentPage {
  key: string;
  route: string;
  locales: Record<Locale, ContentLocale>;
  updatedAt: string;
  publishedAt?: string;
}
export interface AdminEnquiry {
  reference: string;
  locale: Locale;
  type: EnquiryType;
  status: EnquiryStatus;
  name: string;
  email: string;
  message: string;
  details: EnquiryRequest["details"];
  createdAt: string;
  updatedAt: string;
}
export interface AdminActionResult {
  ok: true;
  revision: number;
  publishedAt?: string;
}

export interface LastPublication {
  pageKey: string;
  locale: Locale;
  revision: number;
  action: "publish" | "rollback";
  occurredAt: string;
}
export interface AdminSummary {
  ok: true;
  openEnquiries: number;
  translationsToReview: number;
  lastPublication: LastPublication | null;
}
export interface ContentFieldSchema {
  maxLength: number;
  multiline: boolean;
  label: string;
  group: string;
  editable: boolean;
}
export interface AdminMedia {
  id: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  byteSize: number;
  altText: string;
  source: string;
  published: boolean;
  createdAt: string;
}
export interface AdminMediaList {
  ok: true;
  items: AdminMedia[];
  nextCursor: string | null;
}
