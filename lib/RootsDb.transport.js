/*
	Logfella Roots DB Transport

	Copyright (c) 2015 - 2018 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var tree = require( 'tree-kit' ) ;
var rootsDb = require( 'roots-db' ) ;
var CommonTransport = require( 'logfella-common-transport' ) ;



var logsSchema = {
	url: 'mongodb://localhost:27017/logger-kit/logs' ,
	properties: {
		app: { type: 'string' } ,
		uptime: { type: 'number' } ,
		domain: { type: 'string' } ,
		level: { type: 'integer' } ,
		levelName: { type: 'string' } ,
		time: { instanceOf: Date } ,
		code: { optional: true } ,
		pid: { type: 'integer' } ,
		hostname: { type: 'string' } ,
		meta: { type: 'strictObject' , optional: true } ,
		message: { type: 'string' , default: '' } ,
		messageData: { optional: true } ,
		isFormat: { optional: true }
	} ,
	indexes: [] ,
	hooks: {}
} ;



function RootsDbTransport( logger , config = {} ) {
	CommonTransport.call( this , logger , config ) ;
	

	this.color = !! config.color ;
	this.indent = !! config.indent ;
	this.includeIdMeta = !! config.includeIdMeta ;
	this.includeCommonMeta = !! config.includeCommonMeta ;
	this.includeUserMeta = !! config.includeUserMeta ;
	
	this.schema = tree.extend( { deep: true } , {} , logsSchema ) ;
	if ( typeof config.url === 'string' ) { this.schema.url = config.url ; }

	this.world = rootsDb.World.create() ;
	this.logs = this.world.createCollection( 'logs' , this.schema ) ;
} ;

module.exports = RootsDbTransport ;

RootsDbTransport.prototype = Object.create( CommonTransport.prototype ) ;
RootsDbTransport.prototype.constructor = RootsDbTransport ;



RootsDbTransport.prototype.transport = function transport( data , cache ) {
	//console.log( this.message( time , level , levelName , domain , message ) ) ;

	var log = this.logs.createDocument( {
		app: data.app ,
		time: data.time , //.getTime() ,
		uptime: data.uptime ,
		pid: data.pid ,
		hostname: data.hostname ,
		domain: data.domain ,
		level: data.level ,
		levelName: data.levelName ,
		code: data.code ,
		meta: data.meta || {} ,
		messageData: data.messageData ,
		isFormat: data.isFormat ,
		message: this.messageFormatter( data , cache )
	} ) ;
	
	return new Promise( resolve => { log.$.save( resolve ) ; } ) ;
} ;

