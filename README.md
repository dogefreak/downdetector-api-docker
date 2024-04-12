# Downdetector.com Unofficial APIs - But with Docker Compose and Prometheus!

Uses Unofficial APIs for Downdetector.com website - special thanks to [Davide Violante](https://github.com/DavideViolante/)!
It might not work sometimes (especially .com domain) due to the website being protected by Cloudflare.
The compose file does not contain either Prometheus or Grafana. You are supposed to link this stack to the network of these two (prefferably an internal network, for mDNS).

### Installation with Docker Compose
Not tested on other systems - only Debian 12 with Portainer.
```yml
version: '3'

services:
  nodejs:
    container_name: nodejs
    restart: unless-stopped
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
# HELP downdetector Number of Reports for all Services
# TYPE downdetector gauge
downdetector{name="Ziggo"} 47
downdetector{name="Google"} 1

# HELP downdetector_baseline Baseline for all Services
# TYPE downdetector_baseline gauge
downdetector_baseline{name="Ziggo"} 44
downdetector_baseline{name="Google"} 1
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
Import this JSON data into your Grafana environment...
<details>
  <summary><b>Dashboard</b></summary>
  
  Oh, Grafana...
  
  ```json
  {
    "__inputs": [
      {
        "name": "DS_PROMETHEUS",
        "label": "Prometheus",
        "description": "",
        "type": "datasource",
        "pluginId": "prometheus",
        "pluginName": "Prometheus"
      }
    ],
    "__elements": {},
    "__requires": [
      {
        "type": "grafana",
        "id": "grafana",
        "name": "Grafana",
        "version": "10.4.1"
      },
      {
        "type": "datasource",
        "id": "prometheus",
        "name": "Prometheus",
        "version": "1.0.0"
      },
      {
        "type": "panel",
        "id": "stat",
        "name": "Stat",
        "version": ""
      },
      {
        "type": "panel",
        "id": "timeseries",
        "name": "Time series",
        "version": ""
      }
    ],
    "annotations": {
      "list": [
        {
          "builtIn": 1,
          "datasource": {
            "type": "grafana",
            "uid": "-- Grafana --"
          },
          "enable": true,
          "hide": true,
          "iconColor": "rgba(0, 211, 255, 1)",
          "name": "Annotations & Alerts",
          "type": "dashboard"
        }
      ]
    },
    "editable": true,
    "fiscalYearStartMonth": 0,
    "graphTooltip": 0,
    "id": null,
    "links": [],
    "panels": [
      {
        "datasource": {
          "type": "prometheus",
          "uid": "${DS_PROMETHEUS}"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "fixedColor": "purple",
              "mode": "palette-classic",
              "seriesBy": "last"
            },
            "custom": {
              "axisBorderShow": false,
              "axisCenteredZero": false,
              "axisColorMode": "text",
              "axisLabel": "Aantal Meldingen",
              "axisPlacement": "auto",
              "barAlignment": 0,
              "drawStyle": "line",
              "fillOpacity": 85,
              "gradientMode": "opacity",
              "hideFrom": {
                "legend": false,
                "tooltip": false,
                "viz": false
              },
              "insertNulls": false,
              "lineInterpolation": "smooth",
              "lineStyle": {
                "fill": "solid"
              },
              "lineWidth": 2,
              "pointSize": 5,
              "scaleDistribution": {
                "type": "linear"
              },
              "showPoints": "never",
              "spanNulls": true,
              "stacking": {
                "group": "A",
                "mode": "none"
              },
              "thresholdsStyle": {
                "mode": "area"
              }
            },
            "fieldMinMax": false,
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "#EAB839",
                  "value": 200
                },
                {
                  "color": "red",
                  "value": 500
                }
              ]
            }
          },
          "overrides": [
            {
              "matcher": {
                "id": "byFrameRefID",
                "options": "A"
              },
              "properties": [
                {
                  "id": "custom.gradientMode",
                  "value": "hue"
                },
                {
                  "id": "custom.drawStyle",
                  "value": "line"
                }
              ]
            }
          ]
        },
        "gridPos": {
          "h": 29,
          "w": 12,
          "x": 0,
          "y": 0
        },
        "id": 1,
        "options": {
          "legend": {
            "calcs": [],
            "displayMode": "list",
            "placement": "bottom",
            "showLegend": true
          },
          "tooltip": {
            "mode": "single",
            "sort": "none"
          }
        },
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "${DS_PROMETHEUS}"
            },
            "editorMode": "code",
            "exemplar": false,
            "expr": "((downdetector{name=~\"$reports\"}))",
            "hide": false,
            "instant": false,
            "legendFormat": "{{name}}",
            "range": true,
            "refId": "C"
          }
        ],
        "title": "DownDetector | Reports (5m)",
        "type": "timeseries"
      },
      {
        "datasource": {
          "type": "prometheus",
          "uid": "${DS_PROMETHEUS}"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "#EAB839",
                  "value": 200
                },
                {
                  "color": "red",
                  "value": 500
                }
              ]
            }
          },
          "overrides": []
        },
        "gridPos": {
          "h": 13,
          "w": 12,
          "x": 12,
          "y": 0
        },
        "id": 4,
        "options": {
          "colorMode": "background_solid",
          "graphMode": "none",
          "justifyMode": "center",
          "orientation": "auto",
          "reduceOptions": {
            "calcs": [
              "lastNotNull"
            ],
            "fields": "",
            "values": false
          },
          "showPercentChange": false,
          "textMode": "auto",
          "wideLayout": true
        },
        "pluginVersion": "10.4.1",
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "${DS_PROMETHEUS}"
            },
            "editorMode": "code",
            "expr": "topk(1, max_over_time(downdetector{name=~\"$reports\"}[1m])) by (name)",
            "instant": false,
            "legendFormat": "{{name}} | Current",
            "range": true,
            "refId": "A"
          },
          {
            "datasource": {
              "type": "prometheus",
              "uid": "${DS_PROMETHEUS}"
            },
            "editorMode": "code",
            "expr": "topk(1, max_over_time(downdetector_baseline{name=~\"$reports\"}[1m])) by (name)",
            "hide": false,
            "instant": false,
            "legendFormat": "{{name}} | Baseline",
            "range": true,
            "refId": "B"
          }
        ],
        "title": "DownDetector | Reports (current)",
        "type": "stat"
      },
      {
        "datasource": {
          "type": "prometheus",
          "uid": "${DS_PROMETHEUS}"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "#EAB839",
                  "value": 200
                },
                {
                  "color": "red",
                  "value": 500
                }
              ]
            }
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 6,
          "x": 12,
          "y": 13
        },
        "id": 5,
        "options": {
          "colorMode": "value",
          "graphMode": "area",
          "justifyMode": "auto",
          "orientation": "auto",
          "reduceOptions": {
            "calcs": [
              "lastNotNull"
            ],
            "fields": "",
            "values": false
          },
          "showPercentChange": false,
          "textMode": "name",
          "wideLayout": true
        },
        "pluginVersion": "10.4.1",
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "${DS_PROMETHEUS}"
            },
            "editorMode": "code",
            "exemplar": false,
            "expr": "label_replace(topk(1, max_over_time(downdetector[1m])), \"__name__\", \"$1\", \"name\", \"(.*)\")",
            "instant": true,
            "legendFormat": "{{name}}",
            "range": false,
            "refId": "A"
          }
        ],
        "title": "DownDetector | Most Reports (current)",
        "type": "stat"
      },
      {
        "datasource": {
          "type": "prometheus",
          "uid": "${DS_PROMETHEUS}"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "fixedColor": "purple",
              "mode": "thresholds"
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "#EAB839",
                  "value": 200
                },
                {
                  "color": "red",
                  "value": 500
                }
              ]
            }
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 6,
          "x": 18,
          "y": 13
        },
        "id": 3,
        "options": {
          "colorMode": "value",
          "graphMode": "none",
          "justifyMode": "center",
          "orientation": "auto",
          "reduceOptions": {
            "calcs": [
              "lastNotNull"
            ],
            "fields": "",
            "values": false
          },
          "showPercentChange": false,
          "textMode": "name",
          "wideLayout": true
        },
        "pluginVersion": "10.4.1",
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "${DS_PROMETHEUS}"
            },
            "editorMode": "code",
            "exemplar": false,
            "expr": "label_replace(topk(1, max_over_time(downdetector[24h])), \"__name__\", \"$1\", \"name\", \"(.*)\")",
            "instant": true,
            "legendFormat": "{{name}}",
            "range": false,
            "refId": "A"
          }
        ],
        "title": "DownDetector | Most Reports (24h)",
        "type": "stat"
      },
      {
        "datasource": {
          "type": "prometheus",
          "uid": "${DS_PROMETHEUS}"
        },
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "mappings": [],
            "thresholds": {
              "mode": "absolute",
              "steps": [
                {
                  "color": "green",
                  "value": null
                },
                {
                  "color": "#EAB839",
                  "value": 200
                },
                {
                  "color": "red",
                  "value": 500
                }
              ]
            }
          },
          "overrides": []
        },
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 21
        },
        "id": 2,
        "options": {
          "colorMode": "value",
          "graphMode": "none",
          "justifyMode": "center",
          "orientation": "auto",
          "reduceOptions": {
            "calcs": [
              "lastNotNull"
            ],
            "fields": "",
            "values": false
          },
          "showPercentChange": false,
          "textMode": "auto",
          "wideLayout": true
        },
        "pluginVersion": "10.4.1",
        "targets": [
          {
            "datasource": {
              "type": "prometheus",
              "uid": "${DS_PROMETHEUS}"
            },
            "disableTextWrap": false,
            "editorMode": "code",
            "expr": "topk(1, max_over_time(downdetector{name=~\"$reports\"}[24h])) by (name)",
            "fullMetaSearch": false,
            "includeNullMetadata": true,
            "instant": false,
            "legendFormat": "{{name}}",
            "range": true,
            "refId": "A",
            "useBackend": false
          }
        ],
        "title": "DownDetector | Peak Reports (24h)",
        "type": "stat"
      }
    ],
    "refresh": "5s",
    "schemaVersion": 39,
    "tags": [],
    "templating": {
      "list": [
        {
          "current": {},
          "datasource": {
            "type": "prometheus",
            "uid": "${DS_PROMETHEUS}"
          },
          "definition": "label_values(downdetector,name)",
          "hide": 0,
          "includeAll": true,
          "multi": true,
          "name": "reports",
          "options": [],
          "query": {
            "qryType": 1,
            "query": "label_values(downdetector,name)",
            "refId": "PrometheusVariableQueryEditor-VariableQuery"
          },
          "refresh": 2,
          "regex": "",
          "skipUrlSync": false,
          "sort": 1,
          "type": "query"
        }
      ]
    },
    "time": {
      "from": "now-24h",
      "to": "now"
    },
    "timepicker": {},
    "timezone": "browser",
    "title": "DownDetector",
    "uid": "ddi78eri0iha8b",
    "version": 37,
    "weekStart": ""
  }
  ```

</details>

