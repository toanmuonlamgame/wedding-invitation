import type {
  FontPresetId,
  ThemePresetId,
} from "@/src/types/wedding";

export const DEFAULT_THEME_PRESET: ThemePresetId = "light-elegant";
export const DEFAULT_FONT_PRESET: FontPresetId = "elegant";

type ThemeTokens = {
  paper: string;
  paperDeep: string;
  ink: string;
  muted: string;
  sage: string;
  sageSoft: string;
  forest: string;
  forestDeep: string;
  gold: string;
  white: string;
  line: string;
  card: string;
  overlay: string;
  ornament: string;
  icon: string;
  countdown: string;
  form: string;
};

export const THEME_PRESETS: Record<
  ThemePresetId,
  { label: string; description: string; tokens: ThemeTokens }
> = {
  "light-elegant": {
    label: "Thanh lịch sáng",
    description: "Kem, xanh sage và điểm nhấn vàng nhẹ.",
    tokens: {
      paper: "#fbf8f1",
      paperDeep: "#f1ebdf",
      ink: "#27362d",
      muted: "#6d776f",
      sage: "#7f9482",
      sageSoft: "#dce4db",
      forest: "#3f5848",
      forestDeep: "#293c31",
      gold: "#b18a51",
      white: "#fffdf8",
      line: "rgba(39, 54, 45, 0.17)",
      card: "#fffdf8",
      overlay: "rgba(25, 40, 31, 0.28)",
      ornament: "#b18a51",
      icon: "#3f5848",
      countdown: "#3f5848",
      form: "#fffdf8",
    },
  },
  "dark-elegant": {
    label: "Thanh lịch tối",
    description: "Xanh rừng sâu, chữ kem và sắc vàng ấm.",
    tokens: {
      paper: "#18231d",
      paperDeep: "#101813",
      ink: "#f6eedf",
      muted: "#c2c7bd",
      sage: "#90a78f",
      sageSoft: "#2b3b31",
      forest: "#c5a268",
      forestDeep: "#dfbd7c",
      gold: "#d8b56f",
      white: "#223028",
      line: "rgba(246, 238, 223, 0.2)",
      card: "#223028",
      overlay: "rgba(7, 13, 9, 0.56)",
      ornament: "#d8b56f",
      icon: "#d8b56f",
      countdown: "#d8b56f",
      form: "#223028",
    },
  },
  "blush-romantic": {
    label: "Hồng lãng mạn",
    description: "Hồng phấn, kem và đỏ rượu dịu.",
    tokens: {
      paper: "#fff7f5",
      paperDeep: "#f5e6e3",
      ink: "#4b3035",
      muted: "#80696d",
      sage: "#c99b9e",
      sageSoft: "#f3dfe0",
      forest: "#7a3f4b",
      forestDeep: "#5d2c37",
      gold: "#b98a62",
      white: "#fffaf7",
      line: "rgba(91, 44, 55, 0.17)",
      card: "#fffaf7",
      overlay: "rgba(76, 35, 45, 0.3)",
      ornament: "#b98a62",
      icon: "#7a3f4b",
      countdown: "#7a3f4b",
      form: "#fffaf7",
    },
  },
  "navy-classic": {
    label: "Navy cổ điển",
    description: "Xanh navy, trắng ngà và vàng trang trọng.",
    tokens: {
      paper: "#f8f5ed",
      paperDeep: "#e9e5dc",
      ink: "#17243c",
      muted: "#657087",
      sage: "#687895",
      sageSoft: "#dfe5ef",
      forest: "#20365d",
      forestDeep: "#122541",
      gold: "#b9914f",
      white: "#fffdf7",
      line: "rgba(23, 36, 60, 0.18)",
      card: "#fffdf7",
      overlay: "rgba(12, 27, 52, 0.36)",
      ornament: "#b9914f",
      icon: "#20365d",
      countdown: "#20365d",
      form: "#fffdf7",
    },
  },
  "natural-olive": {
    label: "Olive tự nhiên",
    description: "Be, nâu nhạt và xanh olive mộc mạc.",
    tokens: {
      paper: "#f5f0e6",
      paperDeep: "#e8decd",
      ink: "#3d3a2e",
      muted: "#746f5e",
      sage: "#8b9063",
      sageSoft: "#e1e2cf",
      forest: "#5e633d",
      forestDeep: "#44482d",
      gold: "#a77f4d",
      white: "#fbf8ef",
      line: "rgba(61, 58, 46, 0.18)",
      card: "#fbf8ef",
      overlay: "rgba(55, 54, 35, 0.3)",
      ornament: "#a77f4d",
      icon: "#5e633d",
      countdown: "#5e633d",
      form: "#fbf8ef",
    },
  },
};

export const FONT_PRESETS: Record<
  FontPresetId,
  { label: string; description: string; className: string }
> = {
  elegant: {
    label: "Thanh lịch",
    description: "Serif sang trọng cho tiêu đề, sans-serif dễ đọc cho nội dung.",
    className: "font-preset-elegant",
  },
  modern: {
    label: "Hiện đại",
    description: "Be Vietnam Pro sạch và rõ cho cả tiêu đề lẫn nội dung.",
    className: "font-preset-modern",
  },
  romantic: {
    label: "Lãng mạn",
    description: "Tiêu đề serif nghiêng mềm mại, nội dung vẫn rõ ràng.",
    className: "font-preset-romantic",
  },
  classic: {
    label: "Cổ điển",
    description: "Serif trang trọng với độ tương phản vừa phải.",
    className: "font-preset-classic",
  },
};

export const THEME_IDS = Object.keys(THEME_PRESETS) as ThemePresetId[];
export const FONT_IDS = Object.keys(FONT_PRESETS) as FontPresetId[];

export function isThemePreset(value: unknown): value is ThemePresetId {
  return typeof value === "string" && value in THEME_PRESETS;
}

export function isFontPreset(value: unknown): value is FontPresetId {
  return typeof value === "string" && value in FONT_PRESETS;
}

export function getAppearanceStyle(themePreset: ThemePresetId) {
  const tokens = THEME_PRESETS[themePreset].tokens;
  return {
    "--paper": tokens.paper,
    "--paper-deep": tokens.paperDeep,
    "--ink": tokens.ink,
    "--muted": tokens.muted,
    "--sage": tokens.sage,
    "--sage-soft": tokens.sageSoft,
    "--forest": tokens.forest,
    "--forest-deep": tokens.forestDeep,
    "--gold": tokens.gold,
    "--white": tokens.white,
    "--line": tokens.line,
    "--theme-card": tokens.card,
    "--theme-overlay": tokens.overlay,
    "--theme-ornament": tokens.ornament,
    "--theme-icon": tokens.icon,
    "--theme-countdown": tokens.countdown,
    "--theme-form": tokens.form,
  };
}
