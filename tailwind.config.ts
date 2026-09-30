import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { mountain: { DEFAULT:'#1a3a5c', dark:'#0d2137', light:'#2a5a8c' }, gold: { DEFAULT:'#c8922a', light:'#e8b84b' } } } },
  plugins: [require('@tailwindcss/typography')],
}
export default config
