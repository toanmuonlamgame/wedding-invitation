import type {
  FontPresetId,
  ThemePresetId,
} from "@/src/types/wedding";

export const DEFAULT_THEME_PRESET: ThemePresetId = "ivory-sage";
export const DEFAULT_FONT_PRESET: FontPresetId = "elegant-editorial";

export type FontCategory = "elegant" | "modern" | "romantic" | "classic";

export type ThemeTokens = {
  paper: string;
  paperDeep: string;
  ink: string;
  muted: string;
  accentSoft: string;
  accent: string;
  button: string;
  buttonHover: string;
  buttonText: string;
  focus: string;
  card: string;
  border: string;
  overlay: string;
  ornament: string;
  icon: string;
  countdown: string;
  form: string;
  placeholder: string;
  venue: string;
  story: string;
  wish: string;
  rsvp: string;
  album: string;
};

type ThemePreset = {
  label: string;
  description: string;
  tokens: ThemeTokens;
};

export type FontPreset = {
  label: string;
  category: FontCategory;
  description: string;
  coupleFont: string;
  headingFont: string;
  bodyFont: string;
  wishFont: string;
  headingWeight: string;
  headingStyle: "normal" | "italic";
  headingTracking: string;
  coupleTracking: string;
  coupleStyle: "normal" | "italic";
  className: string;
};

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  "ivory-sage": {
    label: "Ivory Sage",
    description: "Kem ngà, xanh sage và vàng nhạt thanh lịch.",
    tokens: {
      paper: "#fbf8f1",
      paperDeep: "#f1ebdf",
      ink: "#27362d",
      muted: "#6d776f",
      accentSoft: "#dce4db",
      accent: "#b18a51",
      button: "#3f5848",
      buttonHover: "#293c31",
      buttonText: "#fffdf8",
      focus: "#b18a51",
      card: "#fffdf8",
      border: "rgba(39, 54, 45, 0.17)",
      overlay: "rgba(25, 40, 31, 0.28)",
      ornament: "#b18a51",
      icon: "#3f5848",
      countdown: "#3f5848",
      form: "#fffdf8",
      placeholder: "#7f887f",
      venue: "#f1ebdf",
      story: "#fffdf8",
      wish: "#fffdf8",
      rsvp: "#f1ebdf",
      album: "#293c31",
    },
  },
  "champagne-gold": {
    label: "Champagne Gold",
    description: "Champagne, trắng ngà và vàng kim mềm kiểu tiệc cưới.",
    tokens: {
      paper: "#fbf4e8",
      paperDeep: "#efe0c9",
      ink: "#4b3d2e",
      muted: "#7b6b59",
      accentSoft: "#ead7b5",
      accent: "#b58742",
      button: "#936d35",
      buttonHover: "#745326",
      buttonText: "#fffaf1",
      focus: "#c49a58",
      card: "#fffaf1",
      border: "rgba(75, 61, 46, 0.2)",
      overlay: "rgba(67, 47, 25, 0.3)",
      ornament: "#b58742",
      icon: "#936d35",
      countdown: "#936d35",
      form: "#fffaf1",
      placeholder: "#8b7b68",
      venue: "#efe0c9",
      story: "#fffaf1",
      wish: "#fff8ec",
      rsvp: "#f4e8d4",
      album: "#4b3d2e",
    },
  },
  "blush-romance": {
    label: "Blush Romance",
    description: "Hồng phấn, rose và kem nữ tính, lãng mạn.",
    tokens: {
      paper: "#fff7f5",
      paperDeep: "#f5e3e2",
      ink: "#503238",
      muted: "#80696d",
      accentSoft: "#f3d9dc",
      accent: "#bd7d86",
      button: "#813f4e",
      buttonHover: "#612d39",
      buttonText: "#fffaf7",
      focus: "#bd7d86",
      card: "#fffaf7",
      border: "rgba(91, 44, 55, 0.18)",
      overlay: "rgba(76, 35, 45, 0.31)",
      ornament: "#b98a62",
      icon: "#813f4e",
      countdown: "#813f4e",
      form: "#fffaf7",
      placeholder: "#9a7d82",
      venue: "#f5e3e2",
      story: "#fffaf7",
      wish: "#fff2f1",
      rsvp: "#f7e6e7",
      album: "#5d2c37",
    },
  },
  "midnight-navy": {
    label: "Midnight Navy",
    description: "Navy đậm, trắng ngà và vàng cổ điển cao cấp.",
    tokens: {
      paper: "#111c31",
      paperDeep: "#0a1324",
      ink: "#f7f1e5",
      muted: "#b7bfd0",
      accentSoft: "#223453",
      accent: "#d3ad62",
      button: "#d3ad62",
      buttonHover: "#e2c17e",
      buttonText: "#111c31",
      focus: "#e3c681",
      card: "#192843",
      border: "rgba(247, 241, 229, 0.2)",
      overlay: "rgba(5, 12, 26, 0.58)",
      ornament: "#d3ad62",
      icon: "#d3ad62",
      countdown: "#e2c17e",
      form: "#192843",
      placeholder: "#9ca8bd",
      venue: "#172640",
      story: "#192843",
      wish: "#1c2c49",
      rsvp: "#14223a",
      album: "#070e1d",
    },
  },
  "forest-noir": {
    label: "Forest Noir",
    description: "Xanh rừng đậm, đen mềm và vàng đồng trầm sang.",
    tokens: {
      paper: "#16211b",
      paperDeep: "#0d1511",
      ink: "#f3ecdf",
      muted: "#b9c1b6",
      accentSoft: "#293a30",
      accent: "#c69a5c",
      button: "#c69a5c",
      buttonHover: "#d8af72",
      buttonText: "#172119",
      focus: "#deb97d",
      card: "#213028",
      border: "rgba(243, 236, 223, 0.19)",
      overlay: "rgba(5, 11, 7, 0.6)",
      ornament: "#c69a5c",
      icon: "#d2aa70",
      countdown: "#d8af72",
      form: "#213028",
      placeholder: "#9da89e",
      venue: "#1b2922",
      story: "#213028",
      wish: "#24352c",
      rsvp: "#19271f",
      album: "#09100c",
    },
  },
  "burgundy-velvet": {
    label: "Burgundy Velvet",
    description: "Đỏ rượu, kem và vàng tối quyến rũ, phá cách.",
    tokens: {
      paper: "#3b151f",
      paperDeep: "#270c13",
      ink: "#f8ede3",
      muted: "#d3b7b9",
      accentSoft: "#5b2632",
      accent: "#c49a58",
      button: "#c49a58",
      buttonHover: "#d8b273",
      buttonText: "#35121a",
      focus: "#e0bd7d",
      card: "#4b1d29",
      border: "rgba(248, 237, 227, 0.2)",
      overlay: "rgba(36, 6, 13, 0.58)",
      ornament: "#c49a58",
      icon: "#d8b273",
      countdown: "#e0bd7d",
      form: "#4b1d29",
      placeholder: "#c29fa4",
      venue: "#451923",
      story: "#4b1d29",
      wish: "#552331",
      rsvp: "#401620",
      album: "#21080f",
    },
  },
  "lavender-dream": {
    label: "Lavender Dream",
    description: "Lavender, trắng sữa và tím xám bay bổng.",
    tokens: {
      paper: "#f8f5fb",
      paperDeep: "#e9e3f0",
      ink: "#433b53",
      muted: "#756d83",
      accentSoft: "#ded5e8",
      accent: "#9b7cac",
      button: "#685777",
      buttonHover: "#4f405e",
      buttonText: "#fffaff",
      focus: "#9b7cac",
      card: "#fffaff",
      border: "rgba(67, 59, 83, 0.18)",
      overlay: "rgba(60, 45, 76, 0.29)",
      ornament: "#a784b6",
      icon: "#685777",
      countdown: "#685777",
      form: "#fffaff",
      placeholder: "#8c8397",
      venue: "#e9e3f0",
      story: "#fffaff",
      wish: "#f4eef8",
      rsvp: "#ece5f2",
      album: "#433b53",
    },
  },
  "peach-garden": {
    label: "Peach Garden",
    description: "Cam đào, kem và xanh lá nhạt ấm áp, trẻ trung.",
    tokens: {
      paper: "#fff7ed",
      paperDeep: "#f4e4d3",
      ink: "#4d3b32",
      muted: "#7d6c62",
      accentSoft: "#f7d7c3",
      accent: "#dc8f6c",
      button: "#606b42",
      buttonHover: "#4b5534",
      buttonText: "#fffaf2",
      focus: "#dc8f6c",
      card: "#fffaf2",
      border: "rgba(77, 59, 50, 0.18)",
      overlay: "rgba(76, 53, 39, 0.27)",
      ornament: "#c98261",
      icon: "#6f7953",
      countdown: "#6f7953",
      form: "#fffaf2",
      placeholder: "#917f73",
      venue: "#f4e4d3",
      story: "#fffaf2",
      wish: "#fff2e5",
      rsvp: "#f2ead9",
      album: "#594038",
    },
  },
  "terracotta-boho": {
    label: "Terracotta Boho",
    description: "Nâu đất, cam đất và be mang chất boho nghệ thuật.",
    tokens: {
      paper: "#f3e8d8",
      paperDeep: "#dfcdb5",
      ink: "#49362b",
      muted: "#766153",
      accentSoft: "#e5c3a7",
      accent: "#b96442",
      button: "#8d4d35",
      buttonHover: "#6e3927",
      buttonText: "#fff8ed",
      focus: "#bf6f4f",
      card: "#f9f0e3",
      border: "rgba(73, 54, 43, 0.21)",
      overlay: "rgba(78, 43, 29, 0.34)",
      ornament: "#a95739",
      icon: "#8d4d35",
      countdown: "#8d4d35",
      form: "#f9f0e3",
      placeholder: "#8d7564",
      venue: "#dfcdb5",
      story: "#f9f0e3",
      wish: "#f5e4d1",
      rsvp: "#e8d7c0",
      album: "#56372b",
    },
  },
  "black-pearl": {
    label: "Black Pearl",
    description: "Đen, xám than và trắng ngọc trai tối giản hiện đại.",
    tokens: {
      paper: "#101112",
      paperDeep: "#08090a",
      ink: "#f2f1ed",
      muted: "#b6b7b6",
      accentSoft: "#292b2d",
      accent: "#d4d1c8",
      button: "#f2f1ed",
      buttonHover: "#d6d4ce",
      buttonText: "#111214",
      focus: "#ffffff",
      card: "#1b1d1f",
      border: "rgba(242, 241, 237, 0.2)",
      overlay: "rgba(0, 0, 0, 0.66)",
      ornament: "#d4d1c8",
      icon: "#f2f1ed",
      countdown: "#ffffff",
      form: "#1b1d1f",
      placeholder: "#9c9d9d",
      venue: "#17191b",
      story: "#1b1d1f",
      wish: "#202224",
      rsvp: "#151719",
      album: "#050506",
    },
  },
};

const font = {
  body: "var(--font-body)",
  display: "var(--font-display)",
  lora: "var(--font-lora)",
  playfair: "var(--font-playfair)",
  montserrat: "var(--font-montserrat)",
  manrope: "var(--font-manrope)",
  script: "var(--font-script)",
} as const;

function preset(
  config: Omit<FontPreset, "className">,
): FontPreset {
  return { ...config, className: "font-preset-configured" };
}

export const FONT_PRESETS: Record<FontPresetId, FontPreset> = {
  "elegant-editorial": preset({
    label: "Elegant Editorial",
    category: "elegant",
    description: "Playfair biên tập kết hợp Be Vietnam Pro sáng rõ.",
    coupleFont: font.playfair,
    headingFont: font.playfair,
    bodyFont: font.body,
    wishFont: font.lora,
    headingWeight: "500",
    headingStyle: "normal",
    headingTracking: "-0.025em",
    coupleTracking: "-0.035em",
    coupleStyle: "normal",
  }),
  "classic-wedding": preset({
    label: "Classic Wedding",
    category: "elegant",
    description: "Cormorant trang trọng với nội dung Be Vietnam Pro.",
    coupleFont: font.display,
    headingFont: font.display,
    bodyFont: font.body,
    wishFont: font.lora,
    headingWeight: "600",
    headingStyle: "normal",
    headingTracking: "0",
    coupleTracking: "0.01em",
    coupleStyle: "normal",
  }),
  "royal-serif": preset({
    label: "Royal Serif",
    category: "elegant",
    description: "Lora đậm vừa và Playfair tạo cảm giác hoàng gia.",
    coupleFont: font.playfair,
    headingFont: font.lora,
    bodyFont: font.body,
    wishFont: font.lora,
    headingWeight: "600",
    headingStyle: "normal",
    headingTracking: "0.015em",
    coupleTracking: "0.025em",
    coupleStyle: "normal",
  }),
  "french-elegance": preset({
    label: "French Elegance",
    category: "elegant",
    description: "Cormorant nghiêng nhẹ, thanh thoát nhưng không khó đọc.",
    coupleFont: font.display,
    headingFont: font.playfair,
    bodyFont: font.lora,
    wishFont: font.display,
    headingWeight: "500",
    headingStyle: "italic",
    headingTracking: "-0.01em",
    coupleTracking: "0.015em",
    coupleStyle: "italic",
  }),
  "luxury-magazine": preset({
    label: "Luxury Magazine",
    category: "elegant",
    description: "Playfair tương phản với Montserrat chữ rộng cao cấp.",
    coupleFont: font.playfair,
    headingFont: font.playfair,
    bodyFont: font.montserrat,
    wishFont: font.lora,
    headingWeight: "600",
    headingStyle: "normal",
    headingTracking: "-0.04em",
    coupleTracking: "-0.05em",
    coupleStyle: "normal",
  }),
  "modern-clean": preset({
    label: "Modern Clean",
    category: "modern",
    description: "Be Vietnam Pro sạch, đồng nhất và tối ưu tiếng Việt.",
    coupleFont: font.body,
    headingFont: font.body,
    bodyFont: font.body,
    wishFont: font.body,
    headingWeight: "500",
    headingStyle: "normal",
    headingTracking: "-0.035em",
    coupleTracking: "-0.055em",
    coupleStyle: "normal",
  }),
  "minimal-chic": preset({
    label: "Minimal Chic",
    category: "modern",
    description: "Manrope tối giản với khoảng chữ tinh gọn.",
    coupleFont: font.manrope,
    headingFont: font.manrope,
    bodyFont: font.manrope,
    wishFont: font.lora,
    headingWeight: "500",
    headingStyle: "normal",
    headingTracking: "-0.045em",
    coupleTracking: "-0.06em",
    coupleStyle: "normal",
  }),
  "soft-contemporary": preset({
    label: "Soft Contemporary",
    category: "modern",
    description: "Manrope mềm kết hợp Lora ở lời chúc.",
    coupleFont: font.manrope,
    headingFont: font.manrope,
    bodyFont: font.body,
    wishFont: font.lora,
    headingWeight: "400",
    headingStyle: "normal",
    headingTracking: "-0.02em",
    coupleTracking: "-0.035em",
    coupleStyle: "normal",
  }),
  "urban-wedding": preset({
    label: "Urban Wedding",
    category: "modern",
    description: "Montserrat gọn mạnh cho lễ cưới thành thị.",
    coupleFont: font.montserrat,
    headingFont: font.montserrat,
    bodyFont: font.manrope,
    wishFont: font.lora,
    headingWeight: "600",
    headingStyle: "normal",
    headingTracking: "-0.025em",
    coupleTracking: "0.03em",
    coupleStyle: "normal",
  }),
  "scandinavian-light": preset({
    label: "Scandinavian Light",
    category: "modern",
    description: "Manrope nhẹ, khoảng thở rộng và nội dung thanh sạch.",
    coupleFont: font.manrope,
    headingFont: font.manrope,
    bodyFont: font.manrope,
    wishFont: font.body,
    headingWeight: "300",
    headingStyle: "normal",
    headingTracking: "0.025em",
    coupleTracking: "0.055em",
    coupleStyle: "normal",
  }),
  "romantic-script": preset({
    label: "Romantic Script",
    category: "romantic",
    description: "Dancing Script dành riêng cho tên đôi uyên ương.",
    coupleFont: font.script,
    headingFont: font.playfair,
    bodyFont: font.body,
    wishFont: font.lora,
    headingWeight: "500",
    headingStyle: "italic",
    headingTracking: "0",
    coupleTracking: "0",
    coupleStyle: "normal",
  }),
  "garden-calligraphy": preset({
    label: "Garden Calligraphy",
    category: "romantic",
    description: "Cormorant nghiêng như nét bút, Lora dịu cho heading ngắn.",
    coupleFont: font.display,
    headingFont: font.lora,
    bodyFont: font.body,
    wishFont: font.display,
    headingWeight: "500",
    headingStyle: "italic",
    headingTracking: "0.015em",
    coupleTracking: "0.02em",
    coupleStyle: "italic",
  }),
  "dreamy-blossom": preset({
    label: "Dreamy Blossom",
    category: "romantic",
    description: "Cormorant mềm và Dancing Script làm điểm nhấn.",
    coupleFont: font.display,
    headingFont: font.display,
    bodyFont: font.body,
    wishFont: font.script,
    headingWeight: "400",
    headingStyle: "italic",
    headingTracking: "0.02em",
    coupleTracking: "0.03em",
    coupleStyle: "italic",
  }),
  "love-letter": preset({
    label: "Love Letter",
    category: "romantic",
    description: "Lora nghiêng như thư tay với nhịp chữ mộc mạc.",
    coupleFont: font.lora,
    headingFont: font.lora,
    bodyFont: font.lora,
    wishFont: font.lora,
    headingWeight: "500",
    headingStyle: "italic",
    headingTracking: "0",
    coupleTracking: "-0.01em",
    coupleStyle: "italic",
  }),
  "fairytale-wedding": preset({
    label: "Fairytale Wedding",
    category: "romantic",
    description: "Playfair bay bổng kết hợp Cormorant cho lời chúc.",
    coupleFont: font.playfair,
    headingFont: font.playfair,
    bodyFont: font.body,
    wishFont: font.display,
    headingWeight: "600",
    headingStyle: "italic",
    headingTracking: "0.025em",
    coupleTracking: "0.015em",
    coupleStyle: "italic",
  }),
  "vintage-invitation": preset({
    label: "Vintage Invitation",
    category: "classic",
    description: "Lora cổ điển với Cormorant trang trí.",
    coupleFont: font.display,
    headingFont: font.lora,
    bodyFont: font.lora,
    wishFont: font.display,
    headingWeight: "600",
    headingStyle: "normal",
    headingTracking: "0.035em",
    coupleTracking: "0.045em",
    coupleStyle: "normal",
  }),
  "victorian-romance": preset({
    label: "Victorian Romance",
    category: "classic",
    description: "Cormorant đậm và Playfair nghiêng giàu chất cổ điển.",
    coupleFont: font.display,
    headingFont: font.playfair,
    bodyFont: font.lora,
    wishFont: font.display,
    headingWeight: "600",
    headingStyle: "italic",
    headingTracking: "0.04em",
    coupleTracking: "0.06em",
    coupleStyle: "normal",
  }),
  "art-nouveau": preset({
    label: "Art Nouveau",
    category: "classic",
    description: "Playfair cong mềm với Montserrat cân bằng hiện đại.",
    coupleFont: font.playfair,
    headingFont: font.playfair,
    bodyFont: font.montserrat,
    wishFont: font.lora,
    headingWeight: "500",
    headingStyle: "italic",
    headingTracking: "0.05em",
    coupleTracking: "0.075em",
    coupleStyle: "normal",
  }),
  "bohemian-poetry": preset({
    label: "Bohemian Poetry",
    category: "classic",
    description: "Lora giàu chất thơ, script xuất hiện có tiết chế.",
    coupleFont: font.lora,
    headingFont: font.lora,
    bodyFont: font.body,
    wishFont: font.script,
    headingWeight: "500",
    headingStyle: "italic",
    headingTracking: "0.015em",
    coupleTracking: "0.03em",
    coupleStyle: "italic",
  }),
  "cinematic-love": preset({
    label: "Cinematic Love",
    category: "classic",
    description: "Montserrat chữ rộng và Playfair tạo cảm giác điện ảnh.",
    coupleFont: font.playfair,
    headingFont: font.montserrat,
    bodyFont: font.manrope,
    wishFont: font.lora,
    headingWeight: "600",
    headingStyle: "normal",
    headingTracking: "0.09em",
    coupleTracking: "0.035em",
    coupleStyle: "italic",
  }),
};

export const THEME_IDS = Object.keys(THEME_PRESETS) as ThemePresetId[];
export const FONT_IDS = Object.keys(FONT_PRESETS) as FontPresetId[];

const LEGACY_THEME_MAP: Record<string, ThemePresetId> = {
  "light-elegant": "ivory-sage",
  "dark-elegant": "forest-noir",
  "blush-romantic": "blush-romance",
  "navy-classic": "midnight-navy",
  "natural-olive": "ivory-sage",
};

const LEGACY_FONT_MAP: Record<string, FontPresetId> = {
  elegant: "elegant-editorial",
  modern: "modern-clean",
  romantic: "romantic-script",
  classic: "classic-wedding",
};

export function isThemePreset(value: unknown): value is ThemePresetId {
  return typeof value === "string" && value in THEME_PRESETS;
}

export function isFontPreset(value: unknown): value is FontPresetId {
  return typeof value === "string" && value in FONT_PRESETS;
}

export function normalizeThemePreset(value: unknown): ThemePresetId {
  if (isThemePreset(value)) return value;
  if (typeof value === "string" && LEGACY_THEME_MAP[value]) {
    return LEGACY_THEME_MAP[value];
  }
  return DEFAULT_THEME_PRESET;
}

export function normalizeFontPreset(value: unknown): FontPresetId {
  if (isFontPreset(value)) return value;
  if (typeof value === "string" && LEGACY_FONT_MAP[value]) {
    return LEGACY_FONT_MAP[value];
  }
  return DEFAULT_FONT_PRESET;
}

export function getAppearanceStyle(themePreset: ThemePresetId) {
  const tokens = THEME_PRESETS[themePreset].tokens;
  const softTheme =
    themePreset === "ivory-sage" ||
    themePreset === "blush-romance" ||
    themePreset === "lavender-dream" ||
    themePreset === "peach-garden";
  return {
    "--paper": tokens.paper,
    "--paper-deep": tokens.paperDeep,
    "--ink": tokens.ink,
    "--muted": tokens.muted,
    "--sage": tokens.accent,
    "--sage-soft": tokens.accentSoft,
    "--forest": tokens.button,
    "--forest-deep": tokens.buttonHover,
    "--gold": tokens.accent,
    "--white": tokens.buttonText,
    "--line": tokens.border,
    "--theme-card": tokens.card,
    "--theme-overlay": tokens.overlay,
    "--theme-ornament": tokens.ornament,
    "--theme-icon": tokens.icon,
    "--theme-countdown": tokens.countdown,
    "--theme-form": tokens.form,
    "--theme-placeholder": tokens.placeholder,
    "--theme-venue": tokens.venue,
    "--theme-story": tokens.story,
    "--theme-wish": tokens.wish,
    "--theme-rsvp": tokens.rsvp,
    "--theme-album": tokens.album,
    "--theme-button-hover": tokens.buttonHover,
    "--theme-focus": tokens.focus,
    "--radius-sm": softTheme ? "0.75rem" : "0.5rem",
    "--radius-md": softTheme ? "1.25rem" : "0.85rem",
    "--radius-lg": softTheme ? "2rem" : "1.25rem",
    "--radius-pill": "999px",
  };
}

export function getFontPresetStyle(fontPreset: FontPresetId) {
  const preset = FONT_PRESETS[fontPreset];
  return {
    "--theme-couple-font": preset.coupleFont,
    "--theme-heading-font": preset.headingFont,
    "--theme-body-font": preset.bodyFont,
    "--theme-wish-font": preset.wishFont,
    "--theme-heading-weight": preset.headingWeight,
    "--theme-heading-style": preset.headingStyle,
    "--theme-heading-tracking": preset.headingTracking,
    "--theme-couple-tracking": preset.coupleTracking,
    "--theme-couple-style": preset.coupleStyle,
  };
}
