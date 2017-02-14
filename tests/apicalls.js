const test = require('tape');
const http = require('http');

const host = process.env.HOSTNAME;
const port = process.env.PORT;
const alias = require('../src/alias');


test('No URL Provided', (t) => {
  t.plan(2);
  http.get({
    host,
    port,
    path: '/create',
  }, (response) => {
    response.on('data', (data) => {
      t.equal(response.statusCode, 400);
      const parsedData = JSON.parse(data);
      t.equal(parsedData.errCode, '003');
    });
  });
});

test('BAD URL Provided', (t) => {
  t.plan(2);
  http.get({
    host,
    port,
    path: '/create?url=wrong.com',
  }, (response) => {
    response.on('data', (data) => {
      t.equal(response.statusCode, 400);
      const parsedData = JSON.parse(data);
      t.equal(parsedData.errCode, '004');
    });
  });
});

test('Good URL Provided', (t) => {
  t.plan(2);
  http.get({
    host,
    port,
    path: '/create?url=http://wrong.com',
  }, (response) => {
    response.on('data', (data) => {
      t.equal(response.statusCode, 200);
      const parsedData = JSON.parse(data);
      t.notEqual(parsedData.alias, null);
    });
  });
});

test('Good URL Provided with CUSTOM_ALIAS', (t) => {
  t.plan(2);
  const customAlias = alias.gen();
  http.get({
    host,
    port,
    path: `/create?url=http://wrong.com&CUSTOM_ALIAS=${customAlias}`,
  }, (response) => {
    response.on('data', (data) => {
      t.equal(response.statusCode, 200);
      const parsedData = JSON.parse(data);
      t.equal(parsedData.alias, customAlias);
    });
  });
});

test('Create and Get URL', (t) => {
  t.plan(4);
  const customAlias = alias.gen();
  // create
  http.get({
    host,
    port,
    path: `/create?url=http://wrong.com&CUSTOM_ALIAS=${customAlias}`,
  }, (response) => {
    response.on('data', (data) => {
      t.equal(response.statusCode, 200);
      const parsedData = JSON.parse(data);
      t.equal(parsedData.alias, customAlias);

      // get
      http.get({
        host,
        port,
        path: `/${customAlias}`,
      }, (response2) => {
        t.equal(response2.statusCode, 302);
        t.equal(response2.headers.location, 'http://wrong.com');
      });
    });
  });


});
