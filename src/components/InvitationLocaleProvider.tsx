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

const InvitationLocaleContext = createContext<InvitationLocaleValue>({
  language: "vi",
  messages: getInvitationMessages("vi"),
});

export function InvitationLocaleProvider({
  language,
  children,
}: {
  language: InvitationLanguage;
  children: React.ReactNode;
}) {
  const normalized = normalizeInvitationLanguage(language);
  return (
    <InvitationLocaleContext.Provider
      value={{ language: normalized, messages: getInvitationMessages(normalized) }}
    >
      {children}
    </InvitationLocaleContext.Provider>
  );
}

export function useInvitationLocale() {
  return useContext(InvitationLocaleContext);
}
