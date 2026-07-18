import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const distFolder = "dist";
const staticPaths = [
  "index.html",
  "README.txt",
  "OPEN-APP.bat",
  "assets",
  "css",
  "data",
  "js"
];
const copyOnlyEntry = "virtual:copy-only-entry";

function copyAppFiles() {
  return {
    name: "copy-app-files",
    resolveId(id) {
      if (id === copyOnlyEntry) {
        return `\0${copyOnlyEntry}`;
      }

      return null;
    },
    load(id) {
      if (id === `\0${copyOnlyEntry}`) {
        return "";
      }

      return null;
    },
    closeBundle() {
      rmSync(resolve(distFolder), { recursive: true, force: true });
      mkdirSync(resolve(distFolder), { recursive: true });

      for (const path of staticPaths) {
        const source = resolve(path);
        if (existsSync(source)) {
          cpSync(source, resolve(distFolder, path), { recursive: true });
        }
      }
    }
  };
}

export default defineConfig({
  build: {
    copyPublicDir: false,
    rollupOptions: {
      input: copyOnlyEntry
    }
  },
  plugins: [copyAppFiles()]
});
