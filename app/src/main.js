import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import { createPinia } from "pinia";
import App from "./App.vue";

import "./assets/main.css";
import slidesData from "./assets/data/slides.json";

const app = createApp(App, {
    slidesData: slidesData.slides,
    languages: Object.keys(slidesData.messages)
});

app.use(createI18n({
    locale: "de",
    fallbackLocale: "de",
    messages: slidesData.messages
}));
app.use(createPinia());

app.mount("#app");
