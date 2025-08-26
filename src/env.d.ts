/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly API_URL: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
