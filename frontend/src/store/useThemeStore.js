import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "retro",
  
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme }); // This is shorthand for: set({ theme: theme });
  },
}));