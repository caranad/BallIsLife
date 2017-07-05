class Team
{
    constructor()
    {
        this.players = [];
    }

    get_team()
    {
        return this.players;
    }

    // Check if player exists in the team (via name only)
    is_in_team(player)
    {
        for (var i = 0; i < this.players.length; i++)
        {
            if (this.players[i]['name'] == player)
            {
                return true;
            }
        }

        return false;
    }

    add_player(player)
    {
        if (!this.is_in_team(player))
        {
            this.players.push(player);
            return true;
        }

        return false;
    }

    remove_player(player)
    {
        var index = -1;

        if (this.is_in_team(player))
        {
            for (var i = 0; i < this.players.length; i++)
            {
                if (this.players[i]['name'] == player)
                {
                    index = i;
                    console.log(index);
                    this.players.splice(index, 1);
                    return true;
                }
            }
        }

        return false;
    }

    get_size()
    {
        return this.players.length;
    }

    get_player(name)
    {
        for (var i = 0; i < this.players.length; i++)
        {
            if (this.players[i]['name'] == name)
            {
                return this.players[i];
            }
        }

        return undefined;
    }

    get_team_score()
    {
        var score = 0;

        for (var i = 0; i < this.players.length; i++)
        {
            score = score + this.players[i]['skill'];
        }

        return score;
    }

    has_restriction(restriction)
    {
        var r = 0;
        var s = "";

        for (var i = 0; i < restriction.length; i++)
        {
            for (var j = 0; j < this.players.length; j++)
            {
                if (this.players[j]['name'] == restriction[i])
                {
                    r = r + 1;
                }

                if (r == restriction.length)
                {
                    return true;
                }
            }
        }

        return false;
    }

    get_player_skill_level(pl)
    {
        for (var i = 0; i < this.players.length; i++)
        {
            if (this.players[i]['name'] == pl)
            {
                return this.players[i]['skill'];
            }
        }
    }

    // Given a list of players
    best_player(player_list)
    {
        var max = -1;
        var best = undefined;

        for (var i = 0; i < player_list.length; i++)
        {
            var skill_level = this.get_player_skill_level(player_list[i]);
            if (skill_level > max)
            {
                max = skill_level;
                best = player_list[i];
            }
        }

        return best;
    }

    // Trade player 1 to team2. Team trades player 2 to team1
    trade(player1, player2, team)
    {
        if (this.is_in_team(player1['name']) && team.is_in_team(player2['name']))
        {
            var p1 = this.get_player(player1['name']);
            var p2 = team.get_player(player2['name']);
            this.add_player(p2);
            team.remove_player(p2['name']);
            team.add_player(p1);
            this.remove_player(p1['name']);
            return true;
        }

        return false;
    }
}

module.exports = Team;
