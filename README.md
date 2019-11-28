# thingy-api-blue

[![Build Status](https://travis-ci.com/ASE2019-Blue/thingy-api-blue.svg?branch=develop)](https://travis-ci.com/ASE2019-Blue/thingy-api-blue)

## Setup

1.  Copy the file `.env.sample` to `.env` and adjust the configuration
2.  Run `npm install` to install dependencies
3.  Run `npm run server` to start the rest api server

## Documentation

The documentation for this API is written as an OpenAPI Specification. Copy the content of the file `open-api-specification.yaml` to your clipboard, open the [swagger editor](http://editor.swagger.io/) and paste the content into the editor.

## Apply coding standards

To apply the coding standards to the codebase automatically, run `npm run lint`. If errors occur, fix them manually.

## Travis CI

This project uses [Travis CI](https://travis-ci.com/dashboard) as a continuous integration tool.

## Docker

To run this project in a docker container, run `docker run -d -p 3000:3000 -p 3001:3001 christianfries/thingy-api-blue`.