# frontend/Dockerfile
# -----------------------------------------------------------------------------
# MULTI-STAGE build - this is the standard pattern for any Angular/React/Vue
# app going to production:
#
#   Stage 1 ("build"): use a full Node image to run `npm install` and
#   `ng build`, which compiles all the TypeScript/SCSS into plain static
#   HTML/JS/CSS in /app/dist.
#
#   Stage 2 ("serve"): start from a tiny nginx image and copy ONLY the
#   compiled output from Stage 1 into it. The final image never contains
#   Node, npm, node_modules, or any TypeScript source - just static files
#   and an nginx binary. This keeps the production image small (tens of
#   MB instead of the 1GB+ you'd get from shipping the Node build tools).
# -----------------------------------------------------------------------------

# ---- Stage 1: build ----
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# ---- Stage 2: serve ----
FROM nginx:1.27-alpine AS serve

# Remove the default nginx welcome page config.
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular's "application" builder (used in angular.json) outputs to
# dist/pulseboard-frontend/browser - copy exactly that folder's contents.
COPY --from=build /app/dist/pulseboard-frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
