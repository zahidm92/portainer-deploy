/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1a1a1a',
                secondary: '#d4af37', // Gold-ish
                accent: '#f5f5f5',
            }
        },
    },
    plugins: [],
}
