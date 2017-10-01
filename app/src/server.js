var express = require('express');
var app = express();
var got = require('got');

// message stuff
/*
// const {Wit, log} = require('node-wit');
// const client = new Wit({
//   accessToken: ""
// });
*/

const templateresponse = {"message": "", "explore_terms": {}}; 



// funcs
var getinfo = function(search_topic) {
	got("https://learn-anything.xyz/api/maps/?q=" + encodeURI(search_topic))
		.then(search_response => {
			var search_results = JSON.parse(search_response.body); 
			var obj; 
			if (search_results.length == 0) {
				res.send(noresponse);
				return  
			} else {
				obj = search_results[0]; // key n id
			}
			
			got("https://learn-anything.xyz/api/maps/" + obj.id)
			.then(map_response => {
				// compile the results
				var map_results = JSON.parse(map_response.body); 
				var returnmessage = templateresponse; 
				
				returnmessage.message = getdesc(map_results); 
				returnmessage.explore_terms = getmap(obj.key, map_results); 
				
				// send it back
				res.write(returnmessage); 
				res.end();
				console.log("HIHIHI"); 
				// console.log(returnmessage)
				returnmessage = null

			}).catch(search_error => {
				console.log("Map API Error");
				console.log(search_error);
				res.status(500).send("something happened")
			});

		}).catch(search_error => {
			console.log("Search API Error");
			res.status(500).send("something happened")
			console.log(search_error);
		});
}; 

var getdesc = function(map_results) {
	let wikinode = map_results.nodes.find(o => o.category === 'wiki');
	if (wikinode) {
		return "lol bruh, or nah: " + wikinode.url;
	} else {
		return obj.key + " is cool"
	}
}

var getmap = function(key, map_results) {
	// console.log(map_results); 
	var map_terms = {"top": [], "bot": []}; 

	// up
	map_terms.top = map_results.title.split(" - "); 
	map_terms.top.splice(map_terms.top.indexOf("learn anything"), 1);

	// down 
	for (item in map_results.connections) {
		map_terms.bot.push(map_results.connections[item].target.trim()); 
	}

	return map_terms
}; 



//your routes here
app.get('/messages/:message', function (req, res) {
	// getinfo(encodeURI(req.params.message)); 
	got("https://learn-anything.xyz/api/maps/?q=" + encodeURI(req.params.message))
	.then(search_response => {
		var search_results = JSON.parse(search_response.body); 
		var obj; 
		if (search_results.length == 0) {
			res.send(noresponse);
			return  
		} else {
			obj = search_results[0]; // key n id
		}
		
		got("https://learn-anything.xyz/api/maps/" + obj.id)
		.then(map_response => {
			// compile the results
			var map_results = JSON.parse(map_response.body); 
			var returnmessage = templateresponse; 
			
			returnmessage.message = getdesc(map_results); 
			returnmessage.explore_terms = getmap(obj.key, map_results); 
			
			// send it back
			res.send(returnmessage); 
			// console.log(returnmessage)
			returnmessage = null

		}).catch(search_error => {
			console.log("Map API Error");
			console.log(search_error);
			res.status(500).send("something happened")
		});

	}).catch(search_error => {
		console.log("Search API Error");
		console.log(search_error);
		res.status(500).send("something happened")
	});

    // res.send("Hello "+req.params.message+"!");

});

app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});