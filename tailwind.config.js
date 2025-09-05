/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust to your project structure
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        ring: "var(--ring)",
        // add more colors as needed, e.g. primary, secondary, etc.
      },
      outline: {
        ring: ["2px solid var(--ring)", "0px"], // custom outline with ring color
      },
      borderWidth: {
        DEFAULT: '1px',
      },
      // you can also add custom utilities if needed
    },
  },
  plugins: [],
};
