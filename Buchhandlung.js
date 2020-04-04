//Include needed jsons
var config = require('./config');
var secret = require('./secret');
var changelog = require('./changelog');

//Include some Funktions
const f = require('./src/Funktions');
const OS = require('./src/Hardware');
const Web = require('./src/ShopsScraper');
const Twitter = require('./src/Twitter');

//Include simple modules
var fs = require("fs");
const util = require('util');
const mysql = require('mysql'); 
const urlX = require('url');

//Include complex modules
const Telebot = require('telebot');
const bot = new Telebot({
	token: secret.bottoken,
	limit: 1000,
        usePlugins: ['commandButton']
});

//Database
var db = mysql.createPool({
	connectionLimit : 100,
	host: config.dbreaduserhost,
	user: config.dbreaduser,
	password: secret.dbreaduserpwd,
	database: config.database,
	charset : 'utf8mb4'
});

//Create and modify support variables
var Time_started = new Date().getTime();
var botname = config.botname;
var version = config.botversion;
let versionfix = version.replace(/[.]/g,'_',);

var changelog_latest = changelog[versionfix];
var LastConnectionLost = new Date();

//config.isSuperAdmin = '447438490' //Thekla Override

bot.start(); //Telegram bot start


//Startup Message
setTimeout(function(){
console.log("Bot (" + botname + ") started at " + f.getDateTime(new Date()) + " with version " + version)
OS.Hardware.then(function(Hardware) {
	let Output = "Bot started on Version " + version;
	Output = Output + '\n- CPU: ' + Hardware.cpubrand + ' ' + Hardware.cpucores + 'x' + Hardware.cpuspeed + ' Ghz';
	Output = Output + '\n- Load: ' + f.Round2Dec(Hardware.load);
	Output = Output + '%\n- Memory Total: ' + f.Round2Dec(Hardware.memorytotal/1073741824) + ' GB'
	Output = Output + '\n- Memory Free: ' + f.Round2Dec(Hardware.memoryfree/1073741824) + ' GB'
	bot.sendMessage(config.LogChat, Output)
	//console.log(Hardware);
});
f.log("Pushed bot start to the admin");
}, 2000);

//Telegram Errors
bot.on('reconnecting', (reconnecting) => {
	f.log(util.inspect(reconnecting, true, 99));
	f.log("Lost connection");
	var LastConnectionLost = new Date();
});
bot.on('reconnected', (reconnected) => {
	f.log(util.inspect(reconnected, true, 99));
	f.log("connection successfully");
	bot.sendMessage(config.LogChat, "Bot is back online. Lost connection at " + f.getDateTime(LastConnectionLost))
});

//Userimput
bot.on(/^\/update$/i, (msg) => {
	bot.deleteMessage(msg.chat.id, msg.message_id);
	var AnzahlAlt = fs.readFileSync('./Anzahl.txt');
	AnzahlAlt = AnzahlAlt.toString();
	if(msg.from.id == config.isSuperAdmin){
		Web.ShopsScraper.then(function(ShopsScraper) {
			//console.log(ShopsScraper)
			db.getConnection(function(err, connection){
				let sqlcmdadduser = "REPLACE INTO buchhandlungen (Name, Ort, URL) VALUES ?";
				for(i in ShopsScraper){
					if(i <= ShopsScraper.length-2){ //Letztes Element im Array ist ein Statuswert.
						let sqlcmdadduserv = [[ShopsScraper[i].Name, ShopsScraper[i].Ort, ShopsScraper[i].Url]];
						connection.query(sqlcmdadduser, [sqlcmdadduserv], function(err, result) {
							//console.log(sqlcmdadduserv)
							//console.log(result)
						});
					}
				};
				msg.reply.text("Es wurden " + [ShopsScraper.length-1] + " Buchhandlungen eingelesen und verarbeitet.\nIn " + ShopsScraper[ShopsScraper.length-1].OrtFehler + " fehlte ein Ort.")
				fs.writeFile("Anzahl.txt", [ShopsScraper.length-1], (err) => {if (err) console.log(err);
				});
				console.log(AnzahlAlt)
				if(AnzahlAlt >= [ShopsScraper.length-1]){
					console.log("Gleich")
				}else{
					var Unterschied = (ShopsScraper.length-1) - AnzahlAlt;
				}
			connection.release();
			});
		});
	}else{
		msg.reply.text("Entschuldigung, leider hast du nicht die Berechtigung dies zu nutzen.")
	}
});

bot.on(/^\/s( .+)*$/i, (msg, props) => {
	bot.deleteMessage(msg.chat.id, msg.message_id);
	var Para = props.match[1].toLowerCase();
	if(typeof(Para) === 'undefined'){
			msg.reply.text("Leider hast du mir keinen Ort genannt.");
	}else{
		let sqlcmd = "SELECT * FROM buchhandlungen where Ort LIKE '%" + Para.trim() + "%'";
		db.getConnection(function(err, connection){
			connection.query(sqlcmd, function(err, rows){
				let Nachricht = '';
				if(Object.entries(rows).length === 0){
					Nachricht = Nachricht + "An dem angegebenen Ort " + f.capitalizeFirstLetter(Para.trim()) + " leider keine Buchläden gefunden.\n\n"
				}else{
					Nachricht = Nachricht + "An dem angegebenen Ort " + f.capitalizeFirstLetter(Para.trim()) + " wurden folgende Buchläden gefunden.\n\n"
					for(i in rows){
						let name = rows[i].Name
						let ort = rows[i].Ort
						let url = rows[i].URL
						console.log(url)
						Nachricht = Nachricht + "" + name + "\n- Ort: " + f.capitalizeFirstLetter(ort) + "\n- Link: [" + urlX.parse(url).hostname + "](" + url + ")\n\n"
					}
				}
				if(Nachricht.length >= 2000){
					Nachricht = Nachricht + 'Die Suche nach ' + Para.trim() + ' hat zu viele Buchhandlungengefunden.\nGefunden wurden : ' + rows.length + ' Buchhandlungen'
					bot.sendMessage(msg.chat.id, Nachricht, { parseMode: 'markdown', webPreview: false });
				}else{
					bot.sendMessage(msg.chat.id, Nachricht, { parseMode: 'markdown', webPreview: false });
				}
				
			connection.release();
	       });
		});
	}
});
//Basics
bot.on(/^\/botinfo$/i, (msg) => {
	OS.Hardware.then(function(Hardware) {
		let Output = "";
		Output = Output + '\n- CPU: ' + Hardware.cpubrand + ' ' + Hardware.cpucores + 'x' + Hardware.cpuspeed + ' Ghz';
		Output = Output + '\n- Load: ' + f.Round2Dec(Hardware.load);
		Output = Output + '%\n- Memory Total: ' + f.Round2Dec(Hardware.memorytotal/1073741824) + ' GB'
		Output = Output + '\n- Memory Free: ' + f.Round2Dec(Hardware.memoryfree/1073741824) + ' GB'
			msg.reply.text("Botname: " + botname + "\nVersion: " + version + "\nUptime: " + f.uptime(Time_started) + "\n\nLetzte Änderdung: (" + version + ")" + changelog[versionfix] + "\n\nHardware:" + Output).then(function(msg)
			{
				setTimeout(function(){
				bot.deleteMessage(msg.chat.id,msg.message_id);
				}, config.WTdelmsglong);
            });
             bot.deleteMessage(msg.chat.id, msg.message_id);
	});
});

bot.on(['/start', '/help'], (msg) => {
	bot.deleteMessage(msg.chat.id, msg.message_id);
	let Nachricht = '';
	Nachricht = Nachricht + "Mit diesem Bot könnt Ihr in Theklas [Buchliste](https://wintermohn.de/2020/01/11/unabhaengige-buchhandlungen-mit-online-shops/) nach Ort sotieren\n\nBefehle:\n-/help - Zeigt diese Nachricht\n-/s <Ort> - Zählt alle Buchhandlungen dort auf\n-/botinfo - Zeigt alle Infos zu diesem Bot"
	if(msg.from.id == config.isSuperAdmin){
		Nachricht = Nachricht + "\n\nAdmin Befehle:\n-/update - Läd Theklas Liste neu"
	}
	let sqlcmd = "SELECT COUNT(*) AS amount FROM buchhandlungen;";
		db.getConnection(function(err, connection){
                connection.query(sqlcmd, function(err, rows){
					Nachricht = Nachricht + "\n\nAktuell sind " + util.inspect(rows[0].amount,false,null) + " Buchhandlungen meiner Datenbank!"
					msg.reply.text(Nachricht, { parseMode: 'markdown', webPreview: false }).then(function(msg)
					{
						setTimeout(function(){
							bot.deleteMessage(msg.chat.id,msg.message_id);
						}, config.WTdelmsglong);
					});
					connection.release();
	        });
		});
});