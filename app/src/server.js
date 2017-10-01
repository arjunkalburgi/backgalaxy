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
// var getinfo = function(search_topic) {
// 	got("https://learn-anything.xyz/api/maps/?q=" + encodeURI(search_topic))
// 		.then(search_response => {
// 			var search_results = JSON.parse(search_response.body); 
// 			var obj; 
// 			if (search_results.length == 0) {
// 				res.send(noresponse);
// 				return  
// 			} else {
// 				obj = search_results[0]; // key n id
// 			}
			
// 			got("https://learn-anything.xyz/api/maps/" + obj.id)
// 			.then(map_response => {
// 				// compile the results
// 				var map_results = JSON.parse(map_response.body); 
// 				var returnmessage = templateresponse; 
				
// 				returnmessage.message = getdesc(map_results); 
// 				returnmessage.explore_terms = getmap(obj.key, map_results); 
				
// 				// send it back
// 				res.write(returnmessage); 
// 				res.end();
// 				console.log("HIHIHI"); 
// 				// console.log(returnmessage)
// 				returnmessage = null

// 			}).catch(search_error => {
// 				console.log("Map API Error");
// 				console.log(search_error);
// 				res.status(500).send("something happened")
// 			});

// 		}).catch(search_error => {
// 			console.log("Search API Error");
// 			res.status(500).send("something happened")
// 			console.log(search_error);
// 		});
// }; 

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
	var map_terms = {"parent": "", "key": "", graph: []}; 
	// var map_terms = {"top": [], "curr": [], "bot": []}; 

/*
"connections":
[{"source":"organisms","target":"cells  ️","curve":{"x":49.6074,"y":80.9159}},
{"source":"organisms","target":"sex  ️","curve":{"x":109.171,"y":82.0384}},
{"source":"organisms","target":"plants  ️","curve":{"x":-25.319,"y":81.7774}},
{"source":"organisms","target":"immune system  ️","curve":{"x":-121.382,"y":82.8285}}]
,"key":"organisms"}

{"name": "cells", "place": {top: 49.6074, left: 80.9159}, "func": ()=>{this._onPressButton1()} },
{"name": "sex", "place": {top: 109.171, left: 82.0384}, "func": ()=>{console.log("chat of sex")}},
{"name": "plants", "place": {top: 25.319, left: -81.7774}, "func": ()=>{console.log("chat of plants")}},
{"name": "immune system", "place": {top: 121.382, left: -82.8285}, "func": ()=>{console.log("chat of immune system")}}
*/
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