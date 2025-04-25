import path from "path";
import {defineConfig} from "vite";
import viteReact from "@vitejs/plugin-react";
import {TanStackRouterVite} from "@tanstack/router-plugin/vite";

const ReactCompilerConfig = {
    target: "18"
};

export default defineConfig({
    plugins: [
        viteReact(
            {
                babel: {
                    plugins: [
                        ["babel-plugin-react-compiler", ReactCompilerConfig],
                    ],
                },
            }
        ),
        TanStackRouterVite(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        exclude: ["js-big-decimal"]
    },
    base: "/",
});

