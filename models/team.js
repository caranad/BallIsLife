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
        if (this.is_in_team(player))
        {
            this.players.splice(this.players.indexOf(player), 1);
            return true;
        }

        return false;
    }

    get_size()
    {
        return this.players.length;
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
}

module.exports = Team;
