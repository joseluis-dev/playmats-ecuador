// @ts-check
import { defineConfig } from 'astro/config';
import clerk from "@clerk/astro";
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { shadcn, dark } from '@clerk/themes'
import { esES } from '@clerk/localizations';


// https://astro.build/config
export default defineConfig({
  output: 'server',
  
  integrations: [react(), clerk({
    localization: esES,
    appearance: {
      theme: shadcn,
    }
  })],

  vite: {
    plugins: [tailwindcss()],
    server: {
      // Explícitamente permitir tu dominio de ngrok
      allowedHosts: ["a988e5b32401.ngrok-free.app"],
    }
  },

  adapter: vercel(),
});