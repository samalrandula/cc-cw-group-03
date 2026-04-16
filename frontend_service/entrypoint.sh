#!/bin/sh

cat <<EOF >/usr/share/nginx/html/env.js
window.env = {
  VITE_API_BASE_URL: "$VITE_API_BASE_URL",
  VITE_EXCHANGE_API: "$VITE_EXCHANGE_API",
  VITE_COUNTRIES_API: "$VITE_COUNTRIES_API",
  VITE_JOB_ROLES_API: "$VITE_JOB_ROLES_API"
}
EOF

exec nginx -g "daemon off;"