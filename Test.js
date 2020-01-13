var Web = require('./src/ShopsScraper')
var OS = require('./src/Hardware')
var f = require('./src/Funktions');
var fs = require("fs");

/*
OS.Hardware.then(function(Hardware) {
    let Output = 'Test Tweet:\n';
    Output = Output + '\n- CPU: ' + Hardware.cpubrand + ' ' + Hardware.cpucores + 'x' + Hardware.cpuspeed + ' Ghz';
    Output = Output + '\n- Load: ' + f.Round2Dec(Hardware.load);
    Output = Output + '%\n- Memory Total: ' + f.Round2Dec(Hardware.memorytotal/1073741824) + ' GB'
    Output = Output + '\n- Memory Free: ' + f.Round2Dec(Hardware.memoryfree/1073741824) + ' GB'
	console.log(Output)
});*/


/*Web.ShopsScraper.then(function(ShopsScraper) {
	console.log(ShopsScraper)
	//fs.writeFile("HTML.txt", ShopsScraper, (err) => {if (err) console.log(err);
	//});
});*/