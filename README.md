# Adventure CMS

This is a simple JSON-based CMS that creates beautiful "Full Page Scroll" galleries of you images with short texts and captions.

The best way to see its features is to run the code in a Docker container (see below) and explore the Demo page! Data for the Demo page (JSON and royalty-free images from [Pexels](https://www.pexels.com/)) is included with this repository and installed automatically when no own data is supplied.


## Usage

> **Note**: The paths in this file assume the working directory is *this* directory.

Build the Docker image:
```
docker image build -t vuejs-gm-adventure docker/
```


Run a Docker container from that image:

> **Note**: In Windows PowerShell you'll need to use `${PWD}` for current directory substitution. Also make sure that the `entrypoint.sh` file has LF line endings - this is important otherwise running the container will fail.

```
docker container run --name vuejs-gm-adventure -itdp 5173:5173 -v $(pwd)/app:/adventure vuejs-gm-adventure
```


That's it! You can now open http://localhost:5173 on your machine and it will serve the VueJS/Vite app from `./app`.

To build the app for production, exec a shell inside the container and do `npm run build`. Alternatively you can also run an independent, one-time container from the same image with that command, like so:

```
docker container run --rm -it -v $(pwd)/app:/adventure vuejs-gm-adventure npm run build
```

Either will create the build output in the `./app/dist` directory, which you can then just copy to your webserver.


## Details

The directory [sample_data](./app/sample_data/) contains sample data for the Adventure CMS. This consists of the JSON data file `slides.json` as well as images in the [img](./app/sample_data/img/) directory. If you don't provide you own data file in the app's [data](./app/src/assets/data/) directory, the sample file and the images will be copied there and used instead.

### Format of `slides.json`
A JSON object with the following keys:
* `slides` (required): An array of slides. See the sample data for available settings for individual slides.
* `meta` (optional): Object with some / all of the follwing keys:
    * `basePath`: The base path that will be used in the Vite config. Note: Unlike all other data in this file, changes to the base path are applied only once per build and are not being watched.
    * `title`: The window title
    * `desc`: The page meta description
* `messages` (optional): [vue-i18n](https://vue-i18n.intlify.dev/guide/essentials/syntax.html) messages object. If not supplied, English is assumed to be the app language and text translation won't be possible.

### Internationalization
All texts are translatable. If you want to support more than one language, instead of specifying any text directly in the slides array, you should put in only the text's key. Then under `messages` in `slides.json` for each language and for each key you specify the translated text.

Even the texts of built-in components like the PhotoSwipe gallery can be translated by "overriding" the keys that can be viewed in the [i18n.js](./app/src/i18n.js) file.


## License

This project is licensed under the MIT license.

It contains software that is also MIT licensed: the [PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) gallery and a modified and extendended version of the [fullPageScrollPureJS](https://github.com/amendoa/fullPageScrollPureJS) library.