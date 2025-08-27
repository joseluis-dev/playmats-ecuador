// @ts-check
import { defineConfig } from 'astro/config';
import clerk from "@clerk/astro";
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { shadcn, dark } from '@clerk/themes'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  
  integrations: [react(), clerk({
    appearance: {
      theme: shadcn,
    }
  })],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
});