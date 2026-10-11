/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kalyx: {
          red: '#D83A32',
          blue: '#163B75',
          cream: '#F5EBD8',
          ink: '#20201D',
          white: '#FFFCF5',
          stone: '#746F65',
          border: '#CFC4B0',
          success: '#287447',
          amber: '#946200',
          error: '#B42318',
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brutalist: '4px 4px 0px 0px #20201D',
        'brutalist-sm': '2px 2px 0px 0px #20201D',
        'brutalist-red': '4px 4px 0px 0px #D83A32',
        'brutalist-blue': '4px 4px 0px 0px #163B75',
      },
    },
  },
  plugins: [],
};
