# Downdetector.com Unofficial APIs - But with Docker Compose and Prometheus!

Uses Unofficial APIs for Downdetector.com website - special thanks to [Davide Violante](https://github.com/DavideViolante/)!

It might not work sometimes (expecially .com domain) due to the website being protected by Cloudflare.

### Install
Not tested on other systems - only Debian 12 with Portainer!
```yml
version: '3'

services:
  nodejs:
    container_name: nodejs
    # network_mode: internal
    build:
      context: https://github.com/dogefreak/downdetector-api-docker.git
      dockerfile: Dockerfile
    environment:
      - PORT=3333
      - COUNTRY=nl
      - MEASURE_SERVICE=ziggo,google
      - INTERVAL=900 # measurement interval in seconds 
    ports:
      - "3333:3333"
```

### Example
```
T.b.d.
```

### Available inputs
- All the companies for which Downdetector has a page. 

