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
    // Reset the file name
    file_name = '';

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
    if (file_name == '')
    {
        res.redirect('/');
    }
    else
    {
        res.writeHeader(200, {'Content-Type': 'text/html'});
        fs.readFile(file_name, function(err, data)
        {
            players = data.toString();
            var pl = util.generate_players(players);
            var co = util.generate_combos(pl);
            var combos = util.filter_combos(co, [2, 3]);

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
    }
});

app.post('/results', function(req, res)
{
    var avoid_combos = req.body.avoid;
    var player_skills = util.mappify(players);
    var team1 = new Team();
    var team2 = new Team();

    if (file_name == '')
    {
        res.redirect('/');
    }
    if (typeof avoid_combos === 'string')
    {
        avoid_combos = [avoid_combos];
    }
    if (typeof avoid_combos === 'undefined')
    {
        avoid_combos = [];
    }
    // It's gonna be confusing to manage more than 3 restrictions
    if (avoid_combos.length > 3)
    {
        res.redirect('/upload?error=1');
    }
    else
    {
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

        // Manage the restrictions
        if (avoid_combos.length >= 1)
        {
            // Filter for restrictions
            for (var i = 0; i < avoid_combos.length; i++)
            {
                var pl_team = avoid_combos[i].split(",");

                // If restriction is found, trade one of the players to the other team
                if (team1.has_restriction(pl_team))
                {
                    // Find a player with a match
                    for (var i = 0; i < pl_team.length; i++)
                    {
                        var ptt = team1.get_player(pl_team[i]);
                        var similar_player = util.equal_skill_player(ptt, team2);
                        if (similar_player != undefined)
                        {
                            team1.trade(ptt, team2.get_player(similar_player), team2);
                            break;
                        }
                    }
                }
                if (team2.has_restriction(pl_team))
                {
                    for (var i = 0; i < pl_team.length; i++)
                    {
                        var ptt = team2.get_player(pl_team[i]);
                        var similar_player = util.equal_skill_player(ptt, team1);
                        if (similar_player != undefined)
                        {
                            team2.trade(ptt, team1.get_player(similar_player), team1);
                            break;
                        }
                    }
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
    }
});

app.listen(PORT, function()
{
    console.log("BallIsLife generated at http://localhost:" + PORT);
});
