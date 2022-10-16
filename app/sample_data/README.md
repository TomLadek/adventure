This directory contains sample data for the Adventure app. If you don't add a data file `slides.json` to the [data](../src/assets/data/) directory, the sample file from here (and the images from [img](./img/)) will be copied there and used.

## Format of `slides.json`
A JSON object with the following keys:
* `slides` (required): An array of slides
* `meta` (optional): Object with some / all of the follwing keys:
    * `basePath`: The base path that will be used in the Vite config. Note: Unlike all other data in this file, changes to the base path are applied only once per build and are not being watched.
    * `title`: The window title
    * `desc`: The page meta description
* `messages` (optional): [vue-i18n](https://vue-i18n.intlify.dev/guide/essentials/syntax.html) messages object. If not supplied, English is assumed to be the app language and text translation won't be possible.