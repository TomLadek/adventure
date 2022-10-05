import { createApp } from "vue";
import { createPinia } from "pinia";
import { initI18n } from "./i18n";
import App from "./App.vue";

import "./assets/main.css";
import slidesData from "./assets/data/slides.json";

const slideLanguages = Object.keys(slidesData.messages);

const app = createApp(App, {
    slidesData: slidesData.slides,
    languages: slideLanguages
});

app.use(createPinia());
app.use(initI18n(slidesData.messages));

app.mount("#app");
