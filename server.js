var express = require('express');
var handlebars = require('handlebars');
var bodyParser = require('body-parser');
var form = require('formidable');
var fs = require('fs');
var app = express();

var file_name = '';

var PORT = 5555;
var DIR = __dirname + '/public';
app.use(express.static(DIR));
app.use(bodyParser());
app.use(bodyParser.json());

function generate_players(s)
{
    var players = [];
    var items = s.split("\n");
    for (var i = 0; i < items.length; i++)
    {
        players.push(items[i].substring(0, items[i].indexOf(":")));
    }

    return players;
}

/* I suck at recursion so I had to get this function from somewhere */
function generate_combos(pl)
{
    var combos = [];

    if (pl.length == 1)
    {
        return [pl];
    }
    else
    {
    	combos = generate_combos(pl.slice(1));
    	return combos.concat(combos.map(e => e.concat(pl[0])), [[pl[0]]]);
    }
}

function filter_combos(pl, m)
{
    var stringify_combos = [];
    var combos = pl.filter(function(size) { return size.length == m});

    for (var i = 0; i < combos.length; i++)
    {
        var players = combos[i];
        stringify_combos.push(players.join());
    }

    return stringify_combos;
}

app.get('/', function(req, res)
{
    res.sendFile(DIR + '/index.html');
});

app.post('/upload', function(req, res)
{
    var form_data = new form.IncomingForm();
    form_data.parse(req);

    form_data.on('fileBegin', function(name, file)
    {
        if (file.type == 'text/plain')
        {
            file.path = DIR + '/uploads/' + file.name;
            file_name = file.path;
        }
    });

    form_data.on('end', function(name, file)
    {
        res.redirect('/upload');
    });
});

app.get('/upload', function(req, res)
{
    res.writeHeader(200, {'Content-Type': 'text/html'});
    fs.readFile(file_name, function(err, data)
    {
        var players = data.toString();
        var pl = generate_players(players);
        var co = generate_combos(pl);
        var combos = filter_combos(co, pl.length / 2);

        fs.readFile(DIR + '/results.html', function(err, data)
        {
            if (err) { res.sendStatus(200); }
            else
            {
                var template = handlebars.compile(data.toString());
                var html = template({
                    "players": pl,
                    "combos": combos
                });
                res.write(html);
                res.end();
            }
        });
    });
});

app.post('/results', function(req, res)
{
    var s = req.body;
    res.send(s);
});

app.listen(PORT, function()
{
    console.log("BallIsLife generated at http://localhost:" + PORT);
});
