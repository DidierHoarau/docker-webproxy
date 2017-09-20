#!/bin/bash

certbot renew --dry-run
certbot renew

curl -X POST http://localhost:3000/api/services/update/
