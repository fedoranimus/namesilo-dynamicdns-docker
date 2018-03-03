# namesilo-dynamicdns-docker
A docker container to update namesilo's dynamic DNS

docker run -d -v ~Docker/namesilo/hosts.json:/namesilo/hosts.json -e API_KEY='ApiKey' timdturner/namesilo-dynamicdns
