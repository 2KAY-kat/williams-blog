import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    // Configure the root directory for the build/development server
    root: resolve(__dirname, "src"),
    publicDir: resolve(__dirname, "public"),

    build: {
        // Output directory for the production build
        outDir: resolve(__dirname, "dist"),
        emptyOutDir: true,

        // Define entry points for multi-page application
        rollupOptions: {
            input: {
                main: resolve(__dirname, "src/index.html"),
                signup: resolve(__dirname, "src/auth/signup.html"),
                dashboard: resolve(__dirname, "src/admin/dashboard.html"),
                post: resolve(__dirname, "src/post/post.html"),
                // Add other HTML files here as you create them (e.g., single-post.html)
            },
        },
    },
});
