const paginationEmbed = require('discord.js-pagination');

module.exports = {
    name: "topTeam",
    category: "coins",
    aliases: ["teamTop"],
    description: "topTeam",
    usage: "`.topTeam`",
    cooldown: 10,
    run: async (RosaCoins, message, args) => {
        const managers = RosaCoins.managers;
        const { guildManager } = managers.getDataUser(message);

        const topTeams = managers.teamManager.filter(teamManager => teamManager.guildId === message.guild.id).sort((firstValue, secondValue) => {
            return secondValue.bank - firstValue.bank;
        });
        const pages = [];
        let top = 0;
        RosaCoins.functions.chunk( topTeams.array(), 10).map(chunk => {
            if (pages.length > 1) return;
            pages.push({
                fields: chunk.map(team => {
                    top++;
                    return {
                        name: `${top}) ${team.teamName}`,
                        value: `${team.bank.toFixed(2)} Coins`
                    }
                })
            })
        })
        await paginationEmbed(message, pages,  ['⏪', '⏩'], 15000);
    }
}