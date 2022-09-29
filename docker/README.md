Build image:
```
docker image build -t vuejs-adventure docker/
```
    

Run container from that image:
```
docker container run --name vuejs-adventure -itdp 5173:5173 -v ${PWD}/app:/adventure vuejs-adventure
```

Open shell:
```
docker container exec -it vuejs-adventure bash
```


In the shell:
```
npm init -y vue@3.3.4
```

Interactive project create:
* Project name: adventure
* Add *: Pinia, ESLint, Prettier

Still in the shell run one after the other:
```
cd /adventure
npm install
npm run lint
npm run dev -- --host 0.0.0.0
```