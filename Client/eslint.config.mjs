// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactCompiler from "eslint-plugin-react-compiler";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        globals: {
            "use no memo": "readonly",
        },
        plugins: {
            "react-compiler": reactCompiler,
        },
        rules: {
            "react-compiler/react-compiler": "error",
            "semi": ["error", "always"], // Enforce semicolons
            "quotes": ["error", "double"], // Enforce double quotes
        },
    }
);