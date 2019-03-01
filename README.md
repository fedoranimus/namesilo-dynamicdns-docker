# namesilo-dynamicdns-docker
A docker container to update namesilo's dynamic DNS

## Docker
`docker run -d -v /namesilo/hosts.json:/namesilo/hosts.json -e API_KEY='ApiKey' timdturner/namesilo-dynamicdns`

## Sample `hosts.json`
For host `test.example.com` & `test2.example.com`

```json
[
    {
        "domainName": "example.com",
        "hostNames": [
            "test",
            "test2"
        ]
    }
]

```
