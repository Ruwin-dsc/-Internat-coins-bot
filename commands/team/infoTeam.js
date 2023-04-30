module.exports = {
    name: "infoTeam",
    category: "team",
    aliases: ["teamInfo", "team"],
    description: "infoTeam",
    usage: "`.infoTeam`",
    run: async (RosaCoins, message, args) => {
        const {guildManager, userManager} = RosaCoins.managers.getDataUser(message);

        if (!userManager.teamName) return message.reply(`pas de team.`);
        const teamManager = RosaCoins.managers.teamManager.get(`${message.guild.id}-${userManager.teamName}`);
        if (!teamManager) return message.reply(`Team error`);

        if (!message.member.roles.cache.has(teamManager.roleId))
            message.member.roles.add(teamManager.roleId);

        const membersTeam = RosaCoins.managers.userManager.filter(userManager => userManager.teamName === teamManager.teamName && userManager.guildId === message.guild.id && userManager.userId !== teamManager.ownerId);

        message.channel.send({
            embed: {
                description: `**Nom:** ${teamManager.teamName}\n
                **Chef:** <@${teamManager.ownerId}>\n
                **Admins:** ${teamManager.adminIds['admins'].length < 1 ? 'Aucun' : teamManager.adminIds['admins'].map(value => `<@${value}>`).join(', ')}\n
                **Role:** ${teamManager.roleId !== null ? `<@&${teamManager.roleId}>` : 'Aucun'}\n
                **TextChannel:** ${teamManager.textId !== null ? `<#${teamManager.textId}>` : 'Aucun'}\n
                **Slots:** ${teamManager.slot}\n
                **Bank**: ${teamManager.bank} Coins\n
                **Boost:** x${teamManager.boost}\n
                **Members:** (${membersTeam.size} / ${teamManager.slot}) \n ${membersTeam.size < 1 ? 'Aucun' : membersTeam.map(memberTeam => `<@${memberTeam.userId}>`).join(', ')}`
            }
        })
    }
}