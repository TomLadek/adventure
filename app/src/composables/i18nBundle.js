import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

export function useI18nBundle() {
  const { t, locale } = useI18n(),
        i18nBundle = ref({
          t, locale
        });

  watch(locale, async (newLocale) => {
    i18nBundle.value.locale = newLocale;
  });

  return { i18nBundle };
}