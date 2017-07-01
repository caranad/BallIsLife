var express = require('express');
var handlebars = require('handlebars');
var bodyParser = require('body-parser');
var form = require('formidable');
var fs = require('fs');
var util = require('./util/utils');
var app = express();

// Class for Teams
var Team = require('./models/team');

var file_name = '';
var players = '';

var PORT = 5555;
var DIR = __dirname + '/public';
app.use(express.static(DIR));
app.use(bodyParser());
app.use(bodyParser.json());

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

// Assume that the file is always in form for each line:
// PLAYER_NAME: PLAYER_SKILL_LEVEL
app.get('/upload', function(req, res)
{
    res.writeHeader(200, {'Content-Type': 'text/html'});
    fs.readFile(file_name, function(err, data)
    {
        players = data.toString();
        var pl = util.generate_players(players);
        var co = util.generate_combos(pl);
        var combos = util.filter_combos(co, pl.length / 2);

        fs.readFile(DIR + '/prefs.html', function(err, data)
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
    var avoid_combos = req.body.avoid;
    var player_skills = util.mappify(players);
    var team1 = new Team();
    var team2 = new Team();

    // Sort players by skill level
    var sorted = [];
    for (var key in player_skills)
    {
        var z = {};
        z["name"] = key;
        z["skill"] = player_skills[key];
        sorted.push(z);
    }
    sorted.sort(function(a, b) { return b.skill - a.skill; });

    // Add them to teams
    for (var i = 0; i < sorted.length; i++)
    {
        // If skill level of team1 == skill level of team2 AND same size
        if (team1.get_team_score() == team2.get_team_score())
        {
            if (team1.get_size() == team2.get_size())
            {
                team1.add_player(sorted[i]);
            }
            else if (team1.get_size() > team2.get_size())
            {
                team2.add_player(sorted[i]);
            }
            else if (team2.get_size() > team1.get_size())
            {
                team1.add_player(sorted[i]);
            }
        }
        // If skill level of team1 and team2 are different
        else
        {
            // Add player to the team with the lowest score
            if (team1.get_team_score() > team2.get_team_score())
            {
                team2.add_player(sorted[i])
            }
            else
            {
                team1.add_player(sorted[i]);
            }
        }
    }

    fs.readFile(DIR + '/results.html', function(err, data)
    {
        if (err)
        {
            res.sendStatus(404);
        }
        else
        {
            var template = handlebars.compile(data.toString());
            var html = template({
                "team1": team1.get_team(),
                "team2": team2.get_team(),
                "score1": team1.get_team_score(),
                "score2": team2.get_team_score()
            });
            res.write(html);
            res.end();
        }
    });
});

app.listen(PORT, function()
{
    console.log("BallIsLife generated at http://localhost:" + PORT);
});
