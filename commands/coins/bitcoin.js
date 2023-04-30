module.exports = {
    name: "bitcoin",
    category: "coins",
    aliases: ["btc"],
    description: "bitcoin",
    usage: "`.bitcoin`",
    run: (RosaCoins, message, args) => {
        const managers = RosaCoins.managers;
        const { guildManager, userManager } = managers.getDataUser(message);

        message.channel.send({
            embed: getEmbedBTC(message, managers, userManager)
        }).then(mes => {
            const collector = mes.createReactionCollector((reaction, user) => ["1️⃣", "2️⃣"].includes(reaction.emoji.name) && user.id === message.author.id, {max: 5, time: 45000})
            mes.react("1️⃣"); mes.react("2️⃣")

            collector.on("collect", (reaction, user) => {
                if (reaction.emoji.name === "1️⃣") {
                    message.reply(`Combien voulez vous investir dans le bitcoin ? \`exemple: 1200\` \n **VOUS DEVEZ ECRIRE UN CHIFFRE ROND ET AUCUNE AUTRE LETTRE**`);
                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                    }).then(collected => {
                        let btcMiseMessage = collected.array()[0],
                            parsed = parseFloat(btcMiseMessage.content.replace(/ /g, "").replace(/,/g, "."));

                        if (isNaN(parsed)) return message.reply(`Votre mise n'est pas correct !`);
                        if (!isFinite(parsed)) return message.reply(`Votre mise n'est pas correct !`);
                        if (parsed < 1000.0) return message.reply(`Vous devez mettre plus de 1 000 €`);
                        if (parsed > userManager.coins) return message.reply(`Vous n'avez pas assez d'argent !`);

                        userManager.bitcoin += (1/managers.btcPrice) * (parsed / 1000);
                        userManager.coins -= parsed;
                        mes.edit({
                            embed: getEmbedBTC(message, managers, userManager)
                        })
                        message.reply(`Vous avez acheté \`${((1/managers.btcPrice) * (parsed / 1000)).toFixed(9)}\` <:Bitcoin:829921274469548032> pour une valeur de \`${parsed.toLocaleString('fr-EU', {
                            style: 'currency',
                            currency: 'EUR',
                        })}\``)

                    })
                }

                if (reaction.emoji.name === "2️⃣") {
                    userManager.coins += (managers.btcPrice*userManager.bitcoin)*1000;
                    message.reply(`Tu viens de vendre \`${userManager.bitcoin.toFixed(9)}\` <:Bitcoin:829921274469548032> pour une valeur de \`${((managers.btcPrice*userManager.bitcoin)*1000).toLocaleString('fr-EU', {
                        style: 'currency',
                        currency: 'EUR',
                    })}\``).then(mes => mes.delete({timeout: 2500}));
                    userManager.bitcoin = 0.0;
                    mes.edit({
                        embed: getEmbedBTC(message, managers, userManager)
                    })
                }
            })
        })
    }
}

getEmbedBTC = function (message, managers, userManager) {
    const btcSell = (managers.btcPrice*userManager.bitcoin)*1000;
    return {
        title: `Bitcoin | ${message.guild.name}`,
        description: `La valeur du **Bitcoin** est de \`${(1/managers.btcPrice).toFixed(9)}\` <:Bitcoin:829921274469548032> pour \`1 000 €\`
                
                Vous avez \`${userManager.bitcoin.toFixed(9)}\` <:Bitcoin:829921274469548032> ce qui donne \`${btcSell.toLocaleString('fr-EU', {
            style: 'currency',
            currency: 'EUR',
        })}\`
                
                \`\`\`Actions\`\`\`
                \`1️⃣\`》 Acheté du Bitcoins
                
                \`2️⃣\`》 Vendre tous tes Bitcoins (\`${btcSell.toLocaleString('fr-EU', {
            style: 'currency',
            currency: 'EUR',
        })}\`)
                `,
        thumbnail: {
            url: "https://cdn.discordapp.com/attachments/829305648247996437/829925456353820672/bitcoin-superhero-in-a-red-cloak-in-flying-vector-21213400-removebg-preview.png"
        }
    }
}