const CP = require('child_process');


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

var tm = setInterval(function()
{
	GetOsuTitle(function(title)
	{
		console.log(title);
	});
}, 2000);