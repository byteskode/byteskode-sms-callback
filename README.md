byteskode-sms-callback
=====================

[![Build Status](https://travis-ci.org/byteskode/byteskode-sms-callback.svg?branch=master)](https://travis-ci.org/byteskode/byteskode-sms-callback)
byteskode infobip sms deliveries & track callbackbyteskode infobip sms with mongoose persistence support

*Note: All configuration are done using [config](https://github.com/lorenwest/node-config) using key `sms`*

## Requirements
- [mongoose](https://github.com/Automattic/mongoose)
- [byteskode-sms](https://github.com/byteskode/byteskode-sms)
- [express](https://github.com/expressjs/express)

## Installation
```sh
$ npm install --save mongoose byteskode-sms-callback
```

## Usage

```javascript
var mongoose = require('mongoose');
var smsCallback = require('byteskode-sms-callback');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var app = require('express')();

//add required middleware
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//register sms callback
app.use(smsCallback);

```

## Configuration Options
Base on your environment setup, ensure you have the following configurations in your `config` files.

```js
 sms: {
        username: <infobip_username>,
        password: <infobip_password>,
        callback: {
            baseUrl:'http://example.com', //No foward slash at the end
            deliveries: '/sms-deliveries', //ensure foward slush at the begin
        },
        intermediateReport: true,
        models: {
            sms: {
                name: 'SMS',
                // fields: {}
            },
            message: {
                name: 'SMSMessage',
                // fields:{}
            }
        }
    }
```

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```

* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.


## Licence
The MIT License (MIT)

Copyright (c) 2015 byteskode & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 