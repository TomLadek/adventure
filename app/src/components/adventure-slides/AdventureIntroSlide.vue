<script>
import { useI18n } from "vue-i18n";
</script>

<script setup>
const props = defineProps({
  slide: {
    type: Object,
    required: true,
  },
  slideIdx: {
    type: Number,
    required: true,
  },
});

const { t } = useI18n();
</script>

<template>
  <section
    :id="slide.id"
    class="slide slide-intro"
  >
    <span
      v-if="slide.mainImg"
      class="main-picture"
    ></span>

    <div class="content-outer">
      <h1 class="headline">
        {{ t(slide.headline) }}
        <span class="subheadline" v-html="t(slide.subheadline)"></span>
      </h1>

      <div class="content-inner">
        <div class="text-wrapper">
          <p v-html="t(slide.content.text)"></p>
        </div>
  
      </div>
    </div>
  </section>
</template>

<style>
.slide-intro .main-picture {
  z-index: -1;
}

.slide-intro .headline {
  font-size: min(min(22vw, 10em), 22vh);
  text-align: center;
  text-shadow: 3px 3px 2px #ececec75;
  margin: max(2rem, 10vh) 0;
}

.slide-intro .subheadline {
  display: block;
  font-size: 40%;
}

.slide-intro .content-outer {
  display: flex;
  flex-direction: column;
  color: #262626;
}

.slide-intro .content-outer p {
  text-align: center;
  hyphens: auto;
}

.slide-intro .text-wrapper {
  margin: 0 1rem;
  text-align: center;
  font-size: 1.5rem;
}

@media (min-width: 768px) {
}

@media (orientation: landscape) and (max-height: 500px) {
}

@media (orientation: landscape) and (max-height: 500px) {
}
</style>