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

### Usage

```js
import { RpdeValidator } from '@openactive/rpde-validator';

RpdeValidator(
  url, // The URL of the feed to test
  {
    // A callback that is called for log messages
    // Will be provided with an object that looks like:
    // {
    //   verbosity: 1, // 1-3 (higher is more verbose)
    //   percentage: 50, // The percentage complete
    //   message: '...', // String log message
    // }
    logCallback: (log) => {
      console.log(log.message);
    },
    // User agent used by the validator
    // Default: "RPDE_Validator/version (+https://validator.openactive.io/rpde)"
    userAgent: null, 
    // The time in between requests in a feed in milliseconds
    // Default: 0
    requestDelayMs: 1000,
    // The timeout in which to give up on requesting a feed URL
    // Default: 10000
    timeoutMs: 10000,
  }
);
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
