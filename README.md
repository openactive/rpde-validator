# RPDE Validator

The OpenActive RPDE validator library.

[![Build Status](https://travis-ci.org/openactive/rpde-validator.svg?branch=master)](https://travis-ci.org/openactive/rpde-validator)
[![Known Vulnerabilities](https://snyk.io/test/github/openactive/rpde-validator/badge.svg)](https://snyk.io/test/github/openactive/rpde-validator)

## Introduction

This library allows developers to validate RPDE feeds against the latest [Realtime Paged Data Exchange](https://www.openactive.io/realtime-paged-data-exchange/) specification.

## Using in your application

This library can be used in your own application, perhaps as part of your CI pipeline.

### Install

```shell
$ npm install @openactive/rpde-validator
```

## Development

### Getting started

```shell
$ git clone git@github.com:openactive/rpde-validator.git
$ cd rpde-validator
$ npm install
```
### Running tests

This project uses [Jasmine](https://jasmine.github.io/) for its tests. All spec files are located alongside the files that they target.

To run tests locally, run:

```shell
$ npm test
```

The test run will also include a run of [eslint](https://eslint.org/). To run the tests without these, use:

```shell
$ npm run test-no-lint
```
