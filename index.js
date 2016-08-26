'use strict';

const Hapi = require('hapi');
const exec = require('child_process').exec;
const manifest = require('./manifest.json');


// Create a server with a host and port
const server = new Hapi.Server();

function createServiceRoute(service) {
    server.route({
    	method:'GET',
    	path:`${service.path}/{args}`,
    	handler:(request, reply) => {
	    //lol security
	    exec(`${service.command} ${request.params.args}` , (error, stdout) => {
		if(error) {
		    return reply(`Error: ${error.message}`);
		}
		
		return reply(stdout);
	    });
    	    
    	}
    });
}

server.connection({ 
    host: 'localhost', 
    port: 8000 
});

// Add the discovery route
server.route({
    method: 'GET',
    path:'/discover',
    handler:(request, reply) => {
	return reply(JSON.stringify(manifest));
    }
});

//set up the services from the manifest
Object.keys(manifest.services).forEach(service => {
    createServiceRoute(manifest.services[service]);
    
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
