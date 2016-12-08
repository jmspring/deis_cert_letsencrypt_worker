FROM mhart/alpine-node:latest

WORKDIR /src
ADD . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python
RUN apk add --no-cache --virtual .build-deps \
	build-base python gcc g++ make \
	&& npm install \
	&& apk del .build-deps \
	&& apk add --no-cache bash \
	&& mkdir config

EXPOSE 5000
CMD ["node", "index.js"]
