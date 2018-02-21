"use strict";
const CP = require("child_process");
const HTTP = require("http");
const URL = require("url");
const FS = require("fs");
const WS = require("ws");

var webManager;

var WebManager = (function()
{
	function WebManager()
	{
		this.StartWebServer();
		this.StartTitleServer();
		this.StartPanelServer();
	}
	WebManager.prototype.StartWebServer = function()
	{
		var gc = this.GetContent, gm = this.GetMimeType;
		this.WebServer = HTTP.createServer(function(req, res)
		{
			var parsedUrl = URL.parse(req.url);
			console.log(parsedUrl);
			var actualFile = gc(parsedUrl.pathname);
			FS.readFile(".\\" + actualFile, function(err, data)
			{
				if(err)
				{
					console.log("failed to read " + actualFile);
					return;
				}
				res.writeHead(200, {"Content-Type": gm(actualFile)});
				//res.write(data);
				res.end(data, "utf8", function()
				{
					console.log("sent");
				});
			});
		});
		this.WebServer.listen(80);
	};
	WebManager.prototype.StartTitleServer = function()
	{
		this.TitleServer = new WS.Server({ port: 5525 });
		this.TitleServer.on("connection", function connection(ws)
		{
			var tm;
			ws.on("message", function incoming(message)
			{
				//we shouldnt actually be receiving any messages
			});
			ws.on("close", function incoming(c, d)
			{
				console.log("title client disconnect");
				clearInterval(tm);
			});
			ws.on("error", function error(e)
			{
				console.log(e);
			});
			tm = setInterval(function()
			{
				GetOsuTitle(function(title)
				{
					if(ws.readyState == 1)
						ws.send(title);
				});
			}, 2000);
		});
	};
	WebManager.prototype.StartPanelServer = function()
	{
		this.PanelServer = new WS.Server({ port: 5524 });
		this.PanelServer.on("connection", function connection(ws)
		{
			ws.on("message", function incoming(message)
			{
				console.log(message);
			});
			ws.on("close", function incoming(c, d)
			{
				console.log("disconnected");
			});
			ws.on("error", function error(e)
			{
				console.log(e);
			});
			ws.send("hey");
		});
	};
	WebManager.prototype.GetContent = function(address)
	{
		if(address.charAt(0) === "/")
			address = address.substring(1);
		var parts = address.split("/");
		switch(parts[0])
		{
			case "index.html":
				return "index.html";
			case "title.html":
				return "title.html";
			case "favicon.ico":
				return "favicon.ico";
		}
		return "404.html";
	};
	WebManager.prototype.GetMimeType = function(name)
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
	return WebManager;
}());

var offlineMessage = "osu! is currently offline";
var GetOsuTitle = function(cb)
{
	var title = offlineMessage;
	CP.exec("tasklist /fi \"IMAGENAME eq osu!.exe\" /v /fo CSV /nh", function(err, stdout, stderr)
	{
		var lines = stdout.toString().split("\n");
		var parts = lines[0].split(",");
		//"Image Name","PID","Session Name","Session#","Mem Usage","Status","User Name","CPU Time","Window Title"
		if(parts.length < 9 || parts[0] != "\"osu!.exe\"")
		{
			//console.log("unable to find osu process");
			cb(offlineMessage);
			return;
		}
		var txt = parts[9].substring(1, parts[9].length - 2);
		title = txt;
		if(title === "__wglDummyWindowFodder")
		{
			title = offlineMessage;
		}
		cb(title);
	});
};

webManager = new WebManager();