"use strict"; // eslint-disable-line
// Configuration
const HOSTNAME = process.env.HOSTNAME;

// Modules
const isURLvalid = require('valid-url').isWebUri;
const _ = require('lodash');

// Custom Libs
const AliasLib = require('../src/alias');

const AWS = require('aws-sdk');
const DOC = require('dynamodb-doc');

AWS.config.update({
  region: 'us-east-1',
});

const docClient = new DOC.DynamoDB();

// Promisified Dynamodb Get
const getShortUrl = alias =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'shorturls',
      Key: {
        alias,
      },
    };
    console.log(params);
    docClient.getItem(params, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });

// Promisified Dynamodb Get
const addOneToURl = alias =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'shorturls',
      Key: {
        alias,
      },
      UpdateExpression: 'ADD #a :val',
      ExpressionAttributeNames: {
        '#a': 'visitors',
      },
      ExpressionAttributeValues: {
        ':val': 1,
      },
    };
    console.log(params);
    docClient.updateItem(params, (err) => {
      if (err) {
        reject(err);
      }
      resolve(alias);
    });
  });

// Promisified Dynamodb Put
const putShortUrl = (url, alias) =>
    new Promise((resolve, reject) => {
      const params = {
        TableName: 'shorturls',
        Item: {
          alias,
          url,
        },
      };
      docClient.putItem(params, (err) => {
        if (err) {
          reject(err);
        }
        resolve({ url, alias });
      });
    });

// Create Endpoint
const createEntry = (url, customAlias, callback) => {
  const requestStart = new Date().getTime();
  let urlAlias;
  // Check if URL exists
  if (url == null || _.isEmpty(url)) {
    callback(null, {
      errCode: '003',
      description: 'No URL to be shorten provided.',
    });
  }

  // Check if URL is valid
  if (!isURLvalid(url)) {
    callback(null, {
      errCode: '004',
      url,
      description: 'URL is not Valid.',
    });
  }
  // check if custom alias is Valid
  if (customAlias != null && !_.isEmpty(customAlias)) {
    if (!AliasLib.check(customAlias)) {
      callback(null, {
        errCode: '005',
        customAlias,
        description: 'Invalid CUSTOM_ALIAS.',
      });
    }
    urlAlias = customAlias;
  } else {
    urlAlias = AliasLib.gen();
  }

  // Save Alias
  getShortUrl(urlAlias)
    .then((alias) => {
      // checks if alias exists
      if (!_.isEmpty(alias)) {
        callback(null, {
          errCode: '001',
          alias: urlAlias,
          description: 'CUSTOM ALIAS ALREADY EXISTS.',
        });
      }
      // creates alias
      return putShortUrl(url, urlAlias)
        .then((savedAlias) => {
          callback(null, {
            alias: savedAlias.alias,
            visitors: savedAlias.visitors,
            url: `${HOSTNAME}/${savedAlias.alias}`,
            statistics: {
              timeTaken: `${new Date().getTime() - requestStart} ms`,
            },
          });
        });
    });
};

const getEntry = (alias, callback) => {
  const requestStart = new Date().getTime();
  return addOneToURl(alias)
    .then(getShortUrl)
    .then((entry) => {
      const result = entry;
      result.statistics = {
        timeTaken: `${new Date().getTime() - requestStart} ms`,
      };
      callback(null, result);
    })
    .catch((err) => {
      console.log(err);
      callback({
        errCode: '002',
        alias,
        description: 'SHORTENED URL NOT FOUND.',
      });
    });
};

// Router
exports.handler = (event, context, callbackOriginal) => {
  const callback = (ignore, result) => {
    callbackOriginal(JSON.stringify(result));
  };

  switch (event.endpoint) {
    case '/create':
      createEntry(event.url, event.CUSTOM_ALIAS, callback);
      break;
    case '/popular':
      callback(null, 'not yet made');
      break;
    case '/':
      getEntry(event.alias, callbackOriginal);
      break;
    default:
      callback(null, 'Something went wrong');
      break;
  }
};
//
// const callbackMock = (ignore, response) => {
//   console.log(response);
//   process.exit();
// };
//
// const eventTest = {
//   endpoint: '/',
//   url: 'https://google.com',
//   alias: 'megamanx11',
// };
//
// exports.handler(eventTest, {}, callbackMock);
