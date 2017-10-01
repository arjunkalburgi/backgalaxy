let express = require('express');
let app = express();
let got = require('got');

// message stuff
/*
// const {Wit, log} = require('node-wit');
// const client = new Wit({
//   accessToken: ""
// });
*/

const templateresponse = {"message": "", "explore_terms": {}}; 
const noresponse = {"message": "Sorry I don't know about that yet. Try Google, they're a little smarter :)", "explore_terms": {}}; 

// function x(map results)
// {}

// let label = x()

function getdesc(map_results) {


	// console.log("hello:\n"+description+"\n:hello"); 
	// return description
}

function getmap(key, map_results) {
	let map_terms = {"parent": "", "key": "", graph: []}; 

	// up
	let listofparents = map_results.title.split(" - "); 
	map_terms.parent = listofparents[listofparents.length - 2]

	// curr
	map_terms.key = map_results.key

	// down 
	let suggestnodes = map_results.nodes.filter( o => o.category == 'mindmap' );

	for (num in suggestnodes) { 
		let item = suggestnodes[num]; 

		// get node in connections
		let preembednode = map_results.connections.find(o => o.target === item.text.trim());
		let top, left; 
		if (preembednode.curve.x < 0) {
			top = preembednode.curve.x*-1; 
			left = preembednode.curve.y*-1; 
		} else {
			top = preembednode.curve.x; 
			left = preembednode.curve.y; 
		}

		// console.log({"name": item.text.trim(), "place": {"top": top, "left": left}})

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
		let search_results = JSON.parse(search_response.body); 
		let obj; 
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
			let map_results = JSON.parse(map_response.body); 

			// get desc			
			let wikinode = map_results.nodes.find(o => o.category === 'wiki');
			if (wikinode) {
				got("http://tools.buzzstream.com/metaDataService?url=" + encodeURI(wikinode.url))
				.then(metadata_response => {
					let data = JSON.parse(metadata_response.body); 


					let returnmessage = templateresponse; 
					returnmessage.explore_terms = getmap(obj.key, map_results); 
					returnmessage.message = data.description + "\n\n(GALAXY to explore this)"



					res.send(returnmessage); 
				}).catch(metadata_error => {
					console.log("metadata API Error");
					console.log(metadata_error);
					returnmessage.message = "lol bruh, or nah: " + wikinode.url;
					res.send(returnmessage); 
				});
			} else {
				returnmessage.message = obj.key + " is cool"; 
				res.send(returnmessage); 
			}

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