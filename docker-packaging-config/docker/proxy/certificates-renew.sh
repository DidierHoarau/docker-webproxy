#!/bin/bash

certbot renew || true

curl -X POST http://localhost:3000/api/services/update/
