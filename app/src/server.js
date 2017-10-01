var express = require('express');
var app = express();
var got = require('got');

// message stuff
/*
// const {Wit, log} = require('node-wit');
// const client = new Wit({
//   accessToken: ""
// });
const templateresponse = {"message": "", "explore_terms": {}}; 
*/




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
				console.log(returnmessage)
				returnmessage = null

			}).catch(search_error => {
				console.log("Map API Error");
				console.log(search_error);
			});

		}).catch(search_error => {
			console.log("Search API Error");
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
	var map_terms = {"top": [], "bot": []}; 

	// up
	var map_terms.top = map_results.title.split(" - "); 
	map_terms.top.splice(map_terms.top.indexOf("learn anything"), 1);

	// down 
	for (item in map_results.connections) {
		map_terms.bot.append(map_results.connections[item].target.trim()); 
	}

	return map_terms
}; 



//your routes here
app.get('/messages/:message', function (req, res) {
	got("https://learn-anything.xyz/api/maps/?q=" + encodeURI(req.params.message))
	.then(search_response => {
		var search_results = JSON.parse(search_response.body); 
		var obj; 
		if (search_results.length == 0) {
			res.send(noresponse);
			return  
		} else {
			obj = search_results[0]; 
		}
		
		got("https://learn-anything.xyz/api/maps/" + obj.id)
		.then(map_response => {
			// compile the results
			var map_results = JSON.parse(map_response.body); 
			var returnmessage = templateresponse; 
			returnmessage.suggestions = ""; 
			
			let wikinode = map_results.nodes.find(o => o.category === 'wiki');
			if (wikinode) {
				returnmessage.message = "Find out more about " + obj.key + " here: " + wikinode.url;
			} else {
				returnmessage.message = obj.key + " is cool"
			}

			let preembednode = map_results.nodes.find(o => o.text === 'basics'); 
			let embednode = preembednode.nodes.find(o => o.category === 'video');
			if (embednode) {
				returnmessage.embed.message = "Check out this video!"; 
				returnmessage.embed.url = embednode.url; 
			}

			let suggestnodes = map_results.nodes.filter( o => o.category == 'mindmap' );
			for (num in suggestnodes) { 
				if (num == 0) {
					returnmessage.suggestions = "Look up stuff about "
				}
				returnmessage.suggestions = returnmessage.suggestions + suggestnodes[num].text.trim() + ", "; 
				// console.log(returnmessage.suggestions);  
			}
			
			// send it back
			console.log(returnmessage)
			res.send(returnmessage); 
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

    /*
	client.message(req.params.message, {})
	.then((raw_data) => {
		// var data = JSON.stringify(raw_data)
		// get search topic 
		var search_topic = raw_data.entities.wikipedia_search_query[0].value
		// search it in graph 
    	got("https://learn-anything.xyz/api/maps/?q=" + encodeURI(search_topic))
		.then(search_response => {
			var search_results = JSON.parse(search_response.body); 
			var obj; 
			if (search_results.length == 0) {
				res.send(noresponse);
				return  
			} else {
				obj = search_results[0]; 
			}
			
			got("https://learn-anything.xyz/api/maps/" + obj.id)
			.then(map_response => {
				// compile the results
				var map_results = JSON.parse(map_response.body); 
				var returnmessage = templateresponse; 
				returnmessage.suggestions = ""; 
				
				let wikinode = map_results.nodes.find(o => o.category === 'wiki');
				if (wikinode) {
					returnmessage.message = "Find out more about " + obj.key + " here: " + wikinode.url;
				} else {
					returnmessage.message = obj.key + " is cool"
				}

				let preembednode = map_results.nodes.find(o => o.text === 'basics'); 
				let embednode = preembednode.nodes.find(o => o.category === 'video');
				if (embednode) {
					returnmessage.embed.message = "Check out this video!"; 
					returnmessage.embed.url = embednode.url; 
				}

				let suggestnodes = map_results.nodes.filter( o => o.category == 'mindmap' );
				for (num in suggestnodes) { 
					if (num == 0) {
						returnmessage.suggestions = "Look up stuff about "
					}
					returnmessage.suggestions = returnmessage.suggestions + suggestnodes[num].text.trim() + ", "; 
					// console.log(returnmessage.suggestions);  
				}
				
				// send it back
				console.log(returnmessage)
				res.send(returnmessage); 
				returnmessage = null

			}).catch(search_error => {
				console.log("Map API Error");
				console.log(search_error);
			});

		}).catch(search_error => {
			console.log("Search API Error");
			console.log(search_error);
		});
	})
	.catch(console.error);

    */
});

app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});