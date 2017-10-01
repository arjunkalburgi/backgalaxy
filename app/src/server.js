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
const noresponse = {"message": "Sorry I don't know about that yet. Try Google, they're a little smarter :)", "explore_terms": {}}; 

var getdesc = function(map_results) {
	let wikinode = map_results.nodes.find(o => o.category === 'wiki');
	if (wikinode) {
		return "lol bruh, or nah: " + wikinode.url;
	} else {
		return obj.key + " is cool"
	}
}

var getmap = function(key, map_results) {
	var map_terms = {"parent": "", "key": "", graph: []}; 

	// up
	var listofparents = map_results.title.split(" - "); 
	map_terms.parent = listofparents[listofparents.length - 2]

	// curr
	map_terms.key = map_results.key

	// down 
	let suggestnodes = map_results.nodes.filter( o => o.category == 'mindmap' );

	for (num in suggestnodes) { 
		var item = suggestnodes[num]; 

		// get node in connections
		let preembednode = map_results.connections.find(o => o.target === item.text.trim());
		var top, left; 
		if (preembednode.curve.x < 0) {
			top = preembednode.curve.x*-1; 
			left = preembednode.curve.y*-1; 
		} else {
			top = preembednode.curve.x; 
			left = preembednode.curve.y; 
		}

		console.log({"name": item.text.trim(), "place": {"top": top, "left": left}})

		map_terms.graph.push(
			{"name": item.text.trim(), "place": {"top": top, "left": left}}
		); 
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
		// } else if {
			// exact match
			// obj = search_results.find(o => o.key === req.params.message);
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