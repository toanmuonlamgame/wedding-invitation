"use client";

import { createContext, useContext } from "react";
import {
  getInvitationMessages,
  normalizeInvitationLanguage,
  type InvitationLanguage,
} from "@/src/lib/invitation-i18n";

type InvitationLocaleValue = {
  language: InvitationLanguage;
  messages: ReturnType<typeof getInvitationMessages>;
};

type MessageOverrides = Record<string, Record<string, string>>;

const InvitationLocaleContext = createContext<InvitationLocaleValue>({
  language: "vi",
  messages: getInvitationMessages("vi"),
});

export function InvitationLocaleProvider({
  language,
  children,
  overrides,
}: {
  language: InvitationLanguage;
  children: React.ReactNode;
  overrides?: MessageOverrides;
}) {
  const normalized = normalizeInvitationLanguage(language);
  const base = getInvitationMessages(normalized);
  const messages = overrides
    ? (Object.fromEntries(
        Object.entries(base).map(([section, values]) => [
          section,
          values && typeof values === "object"
            ? { ...values, ...(overrides[section] ?? {}) }
            : values,
        ]),
      ) as ReturnType<typeof getInvitationMessages>)
    : base;
  return (
    <InvitationLocaleContext.Provider
      value={{ language: normalized, messages }}
    >
      {children}
    </InvitationLocaleContext.Provider>
  );
}

export function useInvitationLocale() {
  return useContext(InvitationLocaleContext);
}
