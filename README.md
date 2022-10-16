The paths in this file assume the working directory is this directory.

Build the Docker image:
```
docker image build -t vuejs-gm-adventure docker/
```


Run a Docker container from that image:

> Note: In Windows PowerShell you'll need to use `${PDW}` for current directory substitution

```
docker container run --name vuejs-gm-adventure -itdp 5173:5173 -v $(pwd)/app:/adventure vuejs-gm-adventure
```


That's it! You can now open http://localhost:5173 on your machine and it will serve the VueJS/Vite app from `./app`.

To build the app for production, exec a shell inside the container and do `npm run build`. Alternatively you can also run an independent, one-time container from the same image with that command, like so:

```
docker container run --rm -it -v $(pwd)/app:/adventure vuejs-gm-adventure npm run build
```

Either will create the build output in the `./app/dist` directory, which you can then just copy to your webserver.