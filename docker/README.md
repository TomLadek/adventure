Build image:
```
docker image build -t vuejs-adventure docker/
```
    

Run container from that image (PowerShell command):
```
docker container run --name vuejs-adventure -itdp 5173:5173 -v ${PWD}/app:/adventure vuejs-adventure
```

That's it! You can now open http://localhost:5173 on your machine and it will serve the VueJS/Vite app from `./app`.