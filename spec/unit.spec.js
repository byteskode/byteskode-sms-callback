'use strict';

//dependencies
var path = require('path');
var _ = require('lodash');
var faker = require('faker');
var config = require('config');
var expect = require('chai').expect;
var request = require('supertest');
// var mongoose = require('mongoose');
var SMS = require('byteskode-sms');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

//prepare express app
var app = require('express')();
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var router = require(path.join(__dirname, '..'));
app.use(router);

//load fixtures
var intermediate = require(path.join(__dirname, 'fixtures', 'intermediate'));
var deliveries = require(path.join(__dirname, 'fixtures', 'deliveries'));

describe('byteskode sms callback', function() {
    var send = {
        from: 'TEST',
        to: ['+255 716 000 000', '+255 685 111 111'],
        text: faker.lorem.sentence()
    };

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

    var path = _config.callback.deliveries;
    var sms;
    var messages;

    beforeEach(function(done) {
        SMS.remove(done);
    });

    beforeEach(function(done) {
        SMS.send(send, function(error, _sms, _messages) {
            sms = _sms;
            messages = _messages;
            done(error, _sms, _messages);
        });
    });

    it('should be exported', function() {
        expect(router).to.exist;
    });


    it('should throw `Invalid source` when POST with no source in delivery reports', function(done) {
        request(app)
            .post(path)
            .send({})
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                expect(response.message).to.equal('Invalid source');
                done();
            });
    });

    it('should throw `Invalid source` when PUT with no source in delivery reports', function(done) {
        request(app)
            .post(path)
            .send({})
            .query({ _method: 'PUT' })
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                expect(response.message).to.equal('Invalid source');
                done();
            });
    });


    it('should throw `Missing delivery report` when POST with no report in delivery reports', function(done) {
        request(app)
            .post(path)
            .send({})
            .query({ source: sms._id })
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                expect(response.message).to.equal('Missing delivery report');
                done();
            });
    });

    it('should throw `Missing delivery report` when PUT with no report in delivery reports', function(done) {
        request(app)
            .post(path)
            .send({})
            .query({ source: sms._id, _method: 'PUT' })
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                expect(response.message).to.equal('Missing delivery report');
                done();
            });
    });


    it('should be able to receive intermediate report when POST in delivery reports', function(done) {

        var report = {};
        report.results = _.map(messages, function(message) {
            message.status = intermediate.status;
            message.error = intermediate.error;
            return message;
        });

        request(app)
            .post(path)
            .send(report)
            .query({ source: sms._id })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                var message = response[0];
                //assert
                expect(message.status.name).to.equal('PENDING_WAITING_DELIVERY');
                expect(message.error.name).to.equal('EC_ABSENT_SUBSCRIBER');
                done();
            });
    });

    it('should be able to receive intermediate report when PUT in delivery reports', function(done) {

        var report = {};
        report.results = _.map(messages, function(message) {
            message.status = intermediate.status;
            message.error = intermediate.error;
            return message;
        });

        request(app)
            .post(path)
            .send(report)
            .query({ source: sms._id, _method: 'PUT' })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                var message = response[0];
                //assert
                expect(message.status.name).to.equal('PENDING_WAITING_DELIVERY');
                expect(message.error.name).to.equal('EC_ABSENT_SUBSCRIBER');
                done();
            });
    });


    it('should be able to receive delivery report when POST in delivery reports', function(done) {

        var report = {};
        report.results = _.map(messages, function(message) {
            message.status = deliveries.status;
            message.error = deliveries.error;
            return message;
        });

        request(app)
            .post(path)
            .send(report)
            .query({ source: sms._id })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                var message = response[0];
                //assert
                expect(message.status.name).to.equal('DELIVERED_TO_HANDSET');
                expect(message.error.name).to.equal('NO_ERROR');
                done();
            });
    });


    it('should be able to receive delivery report when PUT in delivery reports', function(done) {

        var report = {};
        report.results = _.map(messages, function(message) {
            message.status = deliveries.status;
            message.error = deliveries.error;
            return message;
        });

        request(app)
            .post(path)
            .send(report)
            .query({ source: sms._id, _method: 'PUT' })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                response = response.body;
                var message = response[0];
                //assert
                expect(message.status.name).to.equal('DELIVERED_TO_HANDSET');
                expect(message.error.name).to.equal('NO_ERROR');
                done();
            });
    });

    it('should be able to handle non existing source when POST in delivery reports', function(done) {

        var report = {};
        report.results = _.map(messages, function(message) {
            message.status = deliveries.status;
            message.error = deliveries.error;
            message._id = null;
            return message;
        });

        request(app)
            .post(path)
            .send(report)
            .query({ source: 'xxx' })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                expect(error).to.not.exist;
                expect(response.body).to.have.length(0);
                done();
            });
    });

    it('should be able to handle non existing source when PUT in delivery reports', function(done) {

        var report = {};
        report.results = _.map(messages, function(message) {
            message.status = deliveries.status;
            message.error = deliveries.error;
            message._id = null;
            return message;
        });

        request(app)
            .post(path)
            .send(report)
            .query({ source: 'xxx', _method: 'PUT' })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(error, response) {
                expect(error).to.not.exist;
                expect(response.body).to.have.length(0);
                done();
            });
    });

});