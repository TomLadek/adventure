Build image:
```
docker image build -t vuejs-adventure docker/
```


Run container from that image:

> Use `${PDW}` for current directory substitution in Windows PowerShell

```
docker container run --name vuejs-adventure -itdp 5173:5173 -v $(pwd)/app:/adventure vuejs-adventure
```


That's it! You can now open http://localhost:5173 on your machine and it will serve the VueJS/Vite app from `./app`.