module.exports = {
    name: "teamShop",
    aliases: ["boutiqueTeam", "shopTeam"],
    category: "team",
    cooldown: 1000*10,
    usage: "`.teamShop`",
    description: "shop",
    run: async (RosaCoins, message, args) => {

        const managers = RosaCoins.managers,
            { guildManager, userManager } = managers.getDataUser(message);

        if (!guildManager) return message.reply(`${message.guild.name} not found in manager !`);
        if (!userManager) return;

        if (!userManager.teamName) return message.reply(`Vous n'avez pas de team !.`);

        const { teamManager } = managers.getDataTeam(message, {
            teamName: userManager.teamName
        })

        if (!teamManager) return message.reply(`Team not found, contact admin.`);
        if ( !(teamManager.ownerId === message.author.id || teamManager.adminIds['admins'].includes(message.author.id)) ) return message.reply(`Tu n'es pas admin ou owner de la team !`);

        message.channel.send({

            embed: {
                title: 'LA BOUTIQUE TEAM | ' + message.guild.name,
                description: 'Après un achat, aucun remboursement n\'est possible.',
                fields: [
                    {
                        name: 'Voici les arcticles:',
                        value: `\n**Article 1 - Boost +0.1 [ 75 000 Coins ]** 
                        Avec les boosts, vous augmentez l'argent que vous gagner en étant actif !
                            \n**Article 2 - Slot +1 [ 7 500 Coins ]** 
                        Avec les slots, vous pourrez augmenter le nombre maximum de personne dans votre team !
                        `
                    }
                ]
            }

        }).then(message_ => {

            const collector = message_.createReactionCollector((reaction, user) => ["1️⃣", "2️⃣"].includes(reaction.emoji.name) && user.id === message.author.id, {
                max: 1,
                time: 30000
            })
            message_.react("1️⃣");
            message_.react("2️⃣");

            collector.on('collect', (reaction, user) => {

                if (reaction.emoji.name === "1️⃣") {

                    if (teamManager.bank < 75000) return message.reply("La bank de votre team n'a pas assez d'argent...");
                    if (teamManager.boost >= 0.50) return message.reply("Limit de boost !");


                    teamManager.boost += 0.1;
                    teamManager.bank -= 75000;

                    message.channel.send(
                        "Merci pour votre achat ! Votre team à maintenant un boost à x"
                        + teamManager.boost.toFixed(2) + "."
                    );

                }

                if (reaction.emoji.name === "2️⃣") {

                    if (teamManager.bank < 7500) return message.reply("La bank de votre team n'a pas assez d'argent...");
                    if (teamManager.slot >= 25) return message.reply("Limit de slot !");


                    teamManager.slot += 1;
                    teamManager.bank -= 7500;

                    message.channel.send(
                        "Merci pour votre achat ! Votre team à maintenant "
                        + teamManager.slot + " slots"
                    );
                }
            })
        })
    }
}