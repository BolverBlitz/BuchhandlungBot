# Buchhandlungs Bot for Telegram

### Setup

`npm install`

Enter Telegram Bottoken and MySQL Passwort, if you want to use Twitter you need to insert your keys and secrets in secret.json and enable twitter in config.json
```json
{
    "dbreaduserpwd":"MySQL Passwort",
    "bottoken":"Telegram Bot Token"
}
```

`dbreaduserhost` is the IP of the MySQLServer, you can use localhost if it runs localy.
`dbreaduser` enter MySQL User that has accses to create and modyfiy a DB.
`database` enter Database Name.
```json
{
	"botname":"Buchhandlungs_bot",
	"botversion":"1.0",
	"LogChat":"-1001211106939",
	"isSuperAdmin":"206921999",
	"isSuperAdminUsername":"BolverBlitz",
	"dbreaduserhost":"localhost",
	"dbreaduser":"root",
	"database":"Buchhandlung",
	"WTdelmsgshort":"5400",
	"WTdelmsglong":"15400"
}
```

Then run `node setup`

Then you can start the bot with `npm start`
