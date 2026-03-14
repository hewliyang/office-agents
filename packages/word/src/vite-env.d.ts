/// <reference types="vite/client" />

declare module "*.d.ts?raw" {
  const content: string;
  export default content;
}
