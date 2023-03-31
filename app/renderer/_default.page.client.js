import { createApp } from './app.js'

import "../src/assets/main.css";

export { render }

// Enable Client Routing
export const clientRouting = true;

async function render(pageContext) {
  const app = createApp(pageContext)

  app.mount('body')
}