# Downdetector.com Unofficial APIs - But with Docker Compose and Prometheus!

Uses Unofficial APIs for Downdetector.com website - special thanks to [Davide Violante](https://github.com/DavideViolante/)!

It might not work sometimes (expecially .com domain) due to the website being protected by Cloudflare.

### Installation with Docker Compose
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
### Metrics page example
```
# HELP ziggo_reports Number of reports for ziggo
# TYPE ziggo_reports gauge
ziggo_reports 187

# HELP google_reports Number of reports for google
# TYPE google_reports gauge
google_reports 0
```

### Prometheus Scrape Job
Make sure that the measurement interval and the Prometheus scrape interval are the same!
```yml
  - job_name: 'downdetector'
    scrape_interval: 900s
    static_configs:
    - targets:
      - nodejs:3333
```

### Grafana Dashboard
T.b.d.

