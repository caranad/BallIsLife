module.exports = {
    generate_players: function(s)
    {
        var players = [];
        var items = s.split("\n");
        for (var i = 0; i < items.length; i++)
        {
            players.push(items[i].substring(0, items[i].indexOf(":")));
        }

        return players;
    },

    /* I suck at recursion so I had to get this function from somewhere */
    generate_combos: function(pl)
    {
        var combos = [];

        if (pl.length == 1)
        {
            return [pl];
        }
        else
        {
        	combos = module.exports.generate_combos(pl.slice(1));
        	return combos.concat(combos.map(e => e.concat(pl[0])), [[pl[0]]]);
        }
    },

    filter_combos: function(pl, m)
    {
        var stringify_combos = [];
        var combos = pl.filter(function(size) { return size.length == m});

        for (var i = 0; i < combos.length; i++)
        {
            var players = combos[i];
            stringify_combos.push(players.join());
        }

        return stringify_combos;
    },

    mappify: function(s)
    {
        var arr = s.split("\n");
        var player_skills = {};

        for (var i = 0; i < arr.length; i++)
        {
            var z = arr[i].split(":");
            player_skills[z[0]] = parseFloat(z[1]);
        }

        return player_skills;
    }
}
