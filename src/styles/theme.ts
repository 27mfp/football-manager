export const theme = {
  light: {
    background: "bg-gray-100",
    secondary: "bg-gray-500",
    text: "text-gray-900",
    card: "bg-white",
    primaryButton: "bg-blue-500 hover:bg-blue-600 text-white",
    secondaryButton: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    input: "bg-white border-gray-300 text-gray-900",
    navbar: "bg-blue-600",
  },
  dark: {
    background: "bg-zinc-900",
    secondary: "bg-blue-500",
    text: "text-red-500",
    card: "bg-gray-800",
    primaryButton: "bg-blue-600 hover:bg-blue-700 text-white",
    secondaryButton: "bg-gray-700 hover:bg-gray-600 text-gray-100",
    input: "bg-gray-700 border-gray-600 text-gray-100",
    navbar: "bg-gray-800",
  },
};

export type ThemeType = keyof typeof theme;
