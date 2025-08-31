export interface Template {
  id: string;
  name: string;
  description: string;
  repo: string;
  logo: string | { light: string; dark: string };
  category: "web" | "mobile" | "fullstack";
  features: string[];
  devCommand: string;
  installCommand: string;
  preDevCommand?: string;
  envVars?: Record<string, string>;
  ports?: Array<{ port: number; targetPort: number }>;
}

export const templates: Record<string, Template> = {
  nextjs: {
    id: "nextjs",
    name: "Next.js",
    description: "Full-stack React framework with server-side rendering",
    repo: "https://github.com/freestyle-sh/freestyle-base-nextjs-shadcn",
    logo: {
      light: "/logos/next.svg",
      dark: "/logos/nextjs-light.svg",
    },
    category: "web",
    features: ["React", "TypeScript", "Tailwind CSS", "Shadcn/ui", "Server Actions"],
    devCommand: "npm run dev",
    installCommand: "npm install",
    preDevCommand: "npm run build",
    ports: [{ port: 443, targetPort: 3000 }],
  },
  "vite-react": {
    id: "vite-react",
    name: "Vite (React)",
    description: "Fast React development with Vite bundler",
    repo: "https://github.com/freestyle-sh/freestyle-base-vite-react-typescript-swc",
    logo: "/logos/vite.svg",
    category: "web",
    features: ["React", "TypeScript", "Vite", "SWC", "Fast Refresh"],
    devCommand: "npm run dev",
    installCommand: "npm install",
    ports: [{ port: 443, targetPort: 5173 }],
  },
  expo: {
    id: "expo",
    name: "Expo",
    description: "React Native development platform",
    repo: "https://github.com/freestyle-sh/freestyle-expo",
    logo: {
      light: "/logos/expo.svg",
      dark: "/logos/icons8-expo.svg",
    },
    category: "mobile",
    features: ["React Native", "Expo", "Cross-platform", "Web support"],
    devCommand: "npx expo start --web",
    installCommand: "npm install",
    ports: [{ port: 443, targetPort: 8081 }],
  },
  "nextjs-ecommerce": {
    id: "nextjs-ecommerce",
    name: "Next.js E-commerce",
    description: "Full-stack e-commerce solution with Next.js",
    repo: "https://github.com/freestyle-sh/freestyle-base-nextjs-ecommerce",
    logo: {
      light: "/logos/next.svg",
      dark: "/logos/nextjs-light.svg",
    },
    category: "fullstack",
    features: ["E-commerce", "Stripe", "User Auth", "Admin Panel", "Responsive"],
    devCommand: "npm run dev",
    installCommand: "npm install",
    preDevCommand: "npm run build",
    envVars: {
      STRIPE_PUBLISHABLE_KEY: "pk_test_...",
      STRIPE_SECRET_KEY: "sk_test_...",
      DATABASE_URL: "postgresql://...",
    },
    ports: [{ port: 443, targetPort: 3000 }],
  },
  "vite-vue": {
    id: "vite-vue",
    name: "Vite (Vue)",
    description: "Modern Vue.js development with Vite",
    repo: "https://github.com/freestyle-sh/freestyle-base-vite-vue",
    logo: "/logos/vue.svg",
    category: "web",
    features: ["Vue 3", "TypeScript", "Vite", "Composition API"],
    devCommand: "npm run dev",
    installCommand: "npm install",
    ports: [{ port: 443, targetPort: 5173 }],
  },
  "nuxt3": {
    id: "nuxt3",
    name: "Nuxt 3",
    description: "Vue.js full-stack framework",
    repo: "https://github.com/freestyle-sh/freestyle-base-nuxt3",
    logo: "/logos/nuxt.svg",
    category: "fullstack",
    features: ["Vue 3", "Nuxt 3", "Auto-imports", "File-based routing"],
    devCommand: "npm run dev",
    installCommand: "npm install",
    ports: [{ port: 443, targetPort: 3000 }],
  },
};

// Helper function to get template by ID
export function getTemplate(templateId: string): Template | undefined {
  return templates[templateId];
}

// Helper function to get all templates by category
export function getTemplatesByCategory(category: Template["category"]): Template[] {
  return Object.values(templates).filter(template => template.category === category);
}

// Helper function to get template features as string
export function getTemplateFeatures(templateId: string): string {
  const template = templates[templateId];
  return template ? template.features.join(", ") : "";
}
