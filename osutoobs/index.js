"use strict"
const CP = require("child_process");
const HTTP = require("http");
const URL = require("url");
const FS = require("fs");
const SocketIo = require("socket.io")(HTTP);

var HttpServer = HTTP.createServer(function(req, res)
{
	var parsedUrl = URL.parse(req.url);
	console.log(parsedUrl);
	var actualFile = GetContent(parsedUrl.pathname);
	FS.readFile(".\\" + actualFile, function(err, data)
	{
		if(err)
		{
			console.log("failed to read " + actualFile);
			return;
		}
		res.writeHead(200, {"Content-Type": GetMimeType(actualFile)});
		//res.write(data);
		res.end(data, "utf8", function()
		{
			console.log("sent");
		});
	});
});

var GetContent = function(address)
{
	if(address.charAt(0) === "/")
		address = address.substring(1);
	var parts = address.split("/");
	switch(parts[0])
	{
		case "index.html":
			return "index.html";
		case "favicon.ico":
			return "favicon.ico";
		case "socket.io.js":
			return "socket.io.js";
		case "socket.io.js.map":
			return "socket.io.js.map";
		case "socket.io.slim.js":
			return "socket.io.slim.js";
		case "socket.io.slim.js.map":
			return "socket.io.slim.js.map";
	}
	return "404.html";
};
var GetMimeType = function(name)
{
	var ind = name.lastIndexOf(".");
	if(ind < 0)
		return "text/plain";
	var ending = name.substring(ind);
	switch(ending)
	{
		case ".html":
			return "text/html";
		case ".ico":
			return "image/x-icon";
		case ".map":
			return "application/x-navimap";
	}
	return "text/plain";
};

var GetOsuTitle = function(cb)
{
	var title = "";
	CP.exec("tasklist /fi \"IMAGENAME eq osu!.exe\" /v /fo CSV /nh", function(err, stdout, stderr)
	{
		var lines = stdout.toString().split("\n");
		var parts = lines[0].split(",");
		//"Image Name","PID","Session Name","Session#","Mem Usage","Status","User Name","CPU Time","Window Title"
		if(parts[0] != "\"osu!.exe\"")
		{
			console.log("unable to find osu process");
			return;
		}
		var txt = parts[9].substring(1, parts[9].length - 2);
		title = txt;
		cb(title);
	});
};

HttpServer.listen(80);
SocketIo.on("connection", function()
{
	console.log("ey");
	socket.emit("news", { hello: "world" });
});


/*var tm = setInterval(function()
{
	GetOsuTitle(function(title)
	{
		//console.log(title);
	});
}, 2000);*/
