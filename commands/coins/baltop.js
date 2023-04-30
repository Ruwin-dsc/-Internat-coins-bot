const paginationEmbed = require('discord.js-pagination');

module.exports = {
    name: "baltop",
    category: "coins",
    description: "baltop",
    usage: "`.baltop`",
    cooldown: 10,
    run: async (RosaCoins, message, args) => {
        const managers = RosaCoins.managers;
        const { guildManager } = managers.getDataUser(message);

        const topUsers = managers.userManager.filter(userManager => userManager.guildId === message.guild.id).sort((firstValue, secondValue) => {
            return secondValue.coins - firstValue.coins;
        });
        const pages = [];
        let user_;
        let top = 0;
        RosaCoins.functions.chunk( topUsers.array(), 10).map(chunk => {
	    if (pages.length > 1) return;
            pages.push({
                fields: chunk.map(user => {
                    user_ = message.guild.members.resolve(user.userId);
                    top++;
                    return {
                        name: `${top}) ${user_ ? `${user_.user.tag}` : `Not in ${message.guild.name}`}`,
                        value: `${user.coins.toFixed(2)} Coins`
                    }
                })
            })
        })
        await paginationEmbed(message, pages,  ['⏪', '⏩'], 15000);
    }
}