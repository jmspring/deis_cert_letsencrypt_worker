FROM mhart/alpine-node:latest
# FROM mhart/alpine-node:6

WORKDIR /src
ADD . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python
RUN apk add --no-cache bash python gcc g++ make && \
	mkdir config

# If you need npm, don't use a base tag
RUN npm install

EXPOSE 5000
CMD ["node", "index.js"]
