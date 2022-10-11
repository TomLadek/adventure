<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

function getCssUrlString(url) {
  return `url(${url})`;
}
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

const mainImgUrlXs = computed(() => getCssUrlString(props.slide.mainImg.xs));
const mainImgUrlSm = computed(() => getCssUrlString(props.slide.mainImg.sm));
const mainImgUrlMd = computed(() => getCssUrlString(props.slide.mainImg.md));
const mainImgUrlLg = computed(() => getCssUrlString(props.slide.mainImg.lg));
const mainImgUrlXl = computed(() => getCssUrlString(props.slide.mainImg.xl));
const mainImgUrlXxl = computed(() => getCssUrlString(props.slide.mainImg.xxl));
const mainImgUrlXxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxl));
const mainImgUrlXxxxl = computed(() => getCssUrlString(props.slide.mainImg.xxxxl));

const slideContentClass = computed(() => {
  const baseClass = {
    narrow: props.slide.gallery && props.slide.gallery.style === "grid"
  };
  baseClass[props.slide.content.position] = true;
  return baseClass;
});

const { t } = useI18n();

</script>

<template>
  <section
    :id="slide.id"
    class="slide-intro"
  >
    <a
      v-if="slide.mainImg"
      :href="slide.mainImg.original"
      v-bind="slide.mainImgAttrs"
      :title="slide.mainImgTitle && t(slide.mainImgTitle)"
      target="_blank"
      class="main-picture"
    ></a>

    <div class="slide-intro-content-outer" :class="slideContentClass">
      <h1>
        {{ t(slide.headline) }}
        <span class="slide-intro-subheadline" v-html="t(slide.subheadline)"></span>
      </h1>

      <div class="slide-intro-content-inner">
        <div class="slide-intro-text-wrapper">
          <p v-html="t(slide.content.text)"></p>
        </div>
  
      </div>
    </div>
  </section>
</template>

<style>
.slide-intro {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 100%;
  background-size: cover;
  background-position: center center;
}

.slide-intro h1 {
  font-size: max(4rem, 8vw);
  text-align: center;
  text-shadow: 0px 8px #00000075;
}

.slide-intro-subheadline {
  display: block;
  font-size: max(0.5rem, 4vw);
}

@media (max-resolution: 149dpi) {
  @media (orientation: landscape) and (max-width: 575px) {
    .slide-intro { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: landscape) and (min-width: 576px) {
    .slide-intro { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: landscape) and (min-width: 768px) {
    .slide-intro { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: landscape) and (min-width: 992px) {
    .slide-intro { background-image: v-bind(mainImgUrlLg); }
  }
  @media (orientation: landscape) and (min-width: 1200px) {
    .slide-intro { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: landscape) and (min-width: 1400px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: landscape) and (min-width: 1600px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: landscape) and (min-width: 1920px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxxl); }
  }

  @media (orientation: portrait) and (max-height: 432px) {
    .slide-intro { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: portrait) and (min-height: 576px) {
    .slide-intro { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: portrait) and (min-height: 744px) {
    .slide-intro { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: portrait) and (min-height: 900px) {
    .slide-intro { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: portrait) and (min-height: 1050px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: portrait) and (min-height: 1200px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: portrait) and (min-height: 1440px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxxl); }
  }
}

@media (min-resolution: 150dpi) {
  @media (orientation: landscape) and (max-width: 575px) {
    .slide-intro { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: landscape) and (min-width: 576px) {
    .slide-intro { background-image: v-bind(mainImgUrlLg); }
  }
  @media (orientation: landscape) and (min-width: 768px) {
    .slide-intro { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: landscape) and (min-width: 992px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: landscape) and (min-width: 1200px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxxl); }
  }

  @media (orientation: portrait) and (max-height: 216px) {
    .slide-intro { background-image: v-bind(mainImgUrlXs); }
  }
  @media (orientation: portrait) and (min-height: 288px) {
    .slide-intro { background-image: v-bind(mainImgUrlSm); }
  }
  @media (orientation: portrait) and (min-height: 372px) {
    .slide-intro { background-image: v-bind(mainImgUrlMd); }
  }
  @media (orientation: portrait) and (min-height: 450px) {
    .slide-intro { background-image: v-bind(mainImgUrlXl); }
  }
  @media (orientation: portrait) and (min-height: 525px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxl); }
  }
  @media (orientation: portrait) and (min-height: 600px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxl); }
  }
  @media (orientation: portrait) and (min-height: 825px) {
    .slide-intro { background-image: v-bind(mainImgUrlXxxxl); }
  }
}

.main-picture {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.slide-intro-content-outer p {
  text-align: justify;
  hyphens: auto;
}

.slide-intro-content-outer {
  display: flex;
  flex-direction: column;

  margin: 3rem 0;
}

.slide-intro-text-wrapper {
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
