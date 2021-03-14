const request = require("request");
const util = require("util");
const striptags = require("striptags");

const URL = "https://wintermohn.de/2020/01/11/unabhaengige-buchhandlungen-mit-online-shops/";
var StartTabelle = 0;
var StopTabelle = 0;
var Out = "";
var Tabelle = "";
var OutputObject = [];
var OrtError = 0;

let ShopsScraper = new Promise(function(resolve, reject) {
		request(URL, { json: true }, (err, res, body) => {
			let HTML = body.split('"')
			for(var i = 0; i < HTML.length;i++){
				//console.log(i);
				//Out = Out + i + ":" + HTML[i] + " ";
				if(HTML[i].indexOf("wp-block-table") >= 0){
					console.log("Found!  " + i);
					StartTabelle = i+1;
				}
				if(HTML[i].indexOf("</table>") >= 0){
					console.log("Found 2!  " + i);
					StopTabelle = i;
				}
						
						
			}
			for(var i = StartTabelle; i < StopTabelle;i++){
				Tabelle = Tabelle + HTML[i] + '"'
			}
			
			let NewHTML = Tabelle.split("<tr>");
			//console.log(NewHTML)
			
			for(var i = 1; i < NewHTML.length;i++){
				let temp = NewHTML[i].split("href");
				//console.log(i + ":" + temp)
				let name = temp[0];
				name = name.replace(/<td>/i,"",);
				name = name.replace(/<br>/i,"",);
				name = name.trim();
				//name = name.substring(0, name.indexOf('<'));
				let temp2 = name.split(",");
				let ort = temp2[1]
					//console.log(ort)
				if(typeof(ort) === "undefined"){
					ort = "unbekannt";
					OrtError = OrtError + 1;
				}else{
				ort = ort.trim();
				ort = ort.replace("</td><td>", "");
				ort = ort.trim();
				ort = ort.replace("<a", "");
				ort = ort.trim();
				ort = ort.replace("<br>", "");
				ort = ort.trim();
				ort = ort.replace("<br>", "");
				ort = ort.trim();
				ort = ort.replace('rel="noreferrer noopener"', "");
				ort = ort.trim();
				ort = ort.toLowerCase();
				}
				let nameReal = temp2[0]
				let url = temp[1]
				url = url.replace(/=/i,"",);
				url = url.replace(/"/i,"",);
				url = url.substring(0, url.indexOf('"'));
				//url = url.replace(/"/i,'',);
				url = url.replace('target="_blank"', "");
				url = url.trim();
				
				var Data = {
					Name: nameReal,
					Ort: ort,
					Url: url,
				};
				OutputObject.push(Data);
				
				
				//Out = Out + i + ":Name:" + nameReal + "\n" + i + ":Ort:" + ort + "\n" + i + ":Link:" + url + "\n\n"
			}
			
			var Fehler = {
					OrtFehler: OrtError,
				};
			OutputObject.push(Fehler);
			
			//console.log(OutputObject)
			resolve(OutputObject);
		});
});


module.exports = {
	ShopsScraper
};