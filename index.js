'use strict';

/**
 * @name byteskode-sms-callback
 * @description byteskode infobip sms deliveries & track callback
 * @singleton
 */

//dependencies
var _ = require('lodash');
var config = require('config');
var SMS = require('byteskode-sms');
var Utils = require('byteskode-sms/lib/utils');
var express = require('express');
var router = express.Router();


//prepare configurations
//obtain configuration from config
var _config = config.has('sms') ? config.get('sms') : {};


//merge default configurations
_config = _.merge({}, {
    callback: {
        deliveries: '/sms-deliveries',
    },
    models: {
        sms: {
            name: 'SMS',
        },
        message: {
            name: 'SMSMessage',
        }
    }
}, _config);


//deduce sms deliveries & tracking callback url
var deliveriesPath = _config.callback.deliveries;


//obtain SMS and Message model
var Message = SMS.Message;


/**
 * @name handle
 * @description handle deliveries and tracking reports
 * @param  {Request}   request valid express http request
 * @param  {Function} done    a callback to invoke on success or error
 * @return {Object}          
 */
function handle(request, done) {
    //grab sms _id
    var source = (request.query || {}).source;

    //back of if source is tempered on not available
    if (_.isEmpty(source)) {
        return done(new Error('Invalid source'));
    }


    //ensure delivery or tracking report provided
    var hasNoDeliveryReport =
        request &&
        _.isEmpty(request.body) &&
        (_.isEmpty(request.body.results) || _.isEmpty(request.body.messages));

    if (hasNoDeliveryReport) {
        return done(new Error('Missing delivery report'));
    }

    //obtain message responses from the report
    var responses = Utils.normalize(request.body);

    Message.updateStatuses(responses, function(error, updates) {
        if (error) {
            Message.emit('sms:deliveries:error', error);
            return done(new Error('Unprocessed delivery report'));
        } else {
            Message.emit('sms:deliveries', updates);
            return done(null, _.compact(updates));
        }
    });

}


/**
 * Handle Http POST on sms callback path
 * @description process received sms deliveries & tracking reports
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.post(deliveriesPath, function(request, response) {
    handle(request, function(error, result) {
        if (error) {
            response.status(error.status || 500);
            response.json({
                success: false,
                message: error.message
            });
        } else {
            response.json(result);
        }
    });
});



/**
 * Handle Http PUT on sms callback path
 * @description process received sms deliveries & tracking reports
 * @param  {HttpRequest} request  a http request
 * @param  {HttpResponse} response a http response
 */
router.put(deliveriesPath, function(request, response) {
    handle(request, function(error, result) {
        if (error) {
            response.status(error.status || 500);
            response.json({
                success: false,
                message: error.message
            });
        } else {
            response.json(result);
        }
    });
});

module.exports = exports = router;