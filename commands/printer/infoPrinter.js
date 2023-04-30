module.exports = {
    name: "infoPrinter",
    category: "printer",
    aliases: ["printerInfo", "printer"],
    cooldown: 1000*10,
    description: "infoPrinter",
    usage: "`.infoPrinter`",
    run: async (RosaCoins, message, args) => {
        const managers = RosaCoins.managers,
            { guildManager, userManager, printerManager } = managers.getDataUser(message);
        

        if (!printerManager) return message.reply(`pas de printer.`);
        
        message.channel.send({
            embed: getEmbed(message, printerManager)
        }).then(message_ => {
            const collector = message_.createReactionCollector((reaction, user) => ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"].includes(reaction.emoji.name) && user.id === message.author.id, {time: 60*1000})
            message_.react("1️⃣"); message_.react("2️⃣"); message_.react("3️⃣"); message_.react("4️⃣");message_.react("5️⃣");

            collector.on('collect', (reaction, user) => {
                reaction.users.remove(user.id);
                if (reaction.emoji.name === "1️⃣") {
                    if (printerManager.printerStatus) return message.reply("Tu doit eteindre le printer avant de rajouter des élements !").then(mes => mes.delete({timeout: 2500}));
                    if (printerManager.printerInk >= printerManager.printerLimitInk) return message.reply("Encres remplit a fond !").then(mes => mes.delete({timeout: 2500}));
                    if (userManager.coins < (printerManager.printerLimitInk-printerManager.printerInk)*8) return message.reply("vous n'avez pas assez d'argent.").then(mes => mes.delete({timeout: 2500}));
                    userManager.coins -= (printerManager.printerLimitInk-printerManager.printerInk)*8;
                    printerManager.printerInk = printerManager.printerLimitInk;
                    message_.edit({
                        embed: getEmbed(message, printerManager)
                    })
                    message.reply("tu viens de remplir l'encres a fond !").then(mes => mes.delete({timeout: 2500}));
                }
                if (reaction.emoji.name === "2️⃣") {
                    if (printerManager.printerStatus) return message.reply("Tu doit eteindre le printer avant de rajouter des élements !").then(mes => mes.delete({timeout: 2500}));
                    if (printerManager.printerPaper >= printerManager.printerLimitPaper) return message.reply("Papiers remplit a fond !").then(mes => mes.delete({timeout: 2500}));
                    if (userManager.coins < (printerManager.printerLimitPaper-printerManager.printerPaper)*8) return message.reply("vous n'avez pas assez d'argent.").then(mes => mes.delete({timeout: 2500}));
                    userManager.coins -= (printerManager.printerLimitPaper-printerManager.printerPaper)*8;
                    printerManager.printerPaper = printerManager.printerLimitPaper;
                    message_.edit({
                        embed: getEmbed(message, userManager)
                    })
                    message.reply("tu viens de remplir du papier !").then(mes => mes.delete({timeout: 2500}));
                }
                if (reaction.emoji.name === "3️⃣") {
                    if (printerManager.printerStatus) return message.reply("Tu doit eteindre le printer avant de rajouter des élements !").then(mes => mes.delete({timeout: 2500}));
                    if (printerManager.printerBattery >= printerManager.printerLimitBattery) return message.reply("Batteries charger a fond !").then(mes => mes.delete({timeout: 2500}));
                    if (userManager.coins < (printerManager.printerLimitBattery-printerManager.printerBattery)*10) return message.reply("vous n'avez pas assez d'argent.").then(mes => mes.delete({timeout: 2500}));
                    userManager.coins -= (printerManager.printerLimitBattery-printerManager.printerBattery)*10;
                    printerManager.printerBattery = printerManager.printerLimitBattery;

                    message_.edit({
                        embed: getEmbed(message, printerManager)
                    })
                    message.reply("tu viens de charger la batterie !").then(mes => mes.delete({timeout: 2500}));
                }


                if (reaction.emoji.name === "4️⃣") {
                    if ((printerManager.printerInk < 1 || printerManager.printerPaper < 1 || printerManager.printerBattery < 1) && !printerManager.printerStatus)
                        return message.reply("Tu doit d'abord acheté les élements.").then(mes => mes.delete({timeout: 2500}));
                    printerManager.printerStatus =! printerManager.printerStatus;
                    message_.edit({
                        embed: getEmbed(message, printerManager)
                    })
                    message.reply(`Tu viens ${printerManager.printerStatus ? "d'allumé" : "D'éteindre"} le printer.`).then(mes => mes.delete({timeout: 2500}));
                }

                if (reaction.emoji.name === "5️⃣") {
                    message.reply(`Tu viens de récupèré **${printerManager.printerBank.toLocaleString('fr-EU', {
                        style: 'currency',
                        currency: 'EUR',
                    })}**`).then(mes => mes.delete({timeout: 2500}));
                    userManager.dirtyCoins += parseFloat(printerManager.printerBank);
                    printerManager.printerBank = 0;
                    message_.edit({
                        embed: getEmbed(message, printerManager)
                    })
                }
            })
        })
    }
}

getEmbed = function (message, printerManager) {
    return {
        title: `${message.author.username} Printer`,
        description: `**Status:** ${!printerManager.printerStatus ? '<:printerOff:811759145673031710> (Off)' : '<:printerOn:811759751435911200> (On)'}\n
                **Encres:** ${printerManager.printerInk}/${printerManager.printerLimitInk} Cartouche${printerManager.printerInk < 1 ? '' : 's'} ${printerManager.printerInk >= 20 ? '(Full)' : ''}\n
                **Papiers:** ${printerManager.printerPaper}/${printerManager.printerLimitPaper} Feuille${printerManager.printerPaper < 1 ? '' : 's'} ${printerManager.printerPaper >= 20 ? '(Full)' : ''}\n
                **Batteries:** ${printerManager.printerBattery}% ${printerManager.printerBattery >= 100 ? '(Charger)' : ''}\n
                **Argents:** ${printerManager.printerBank.toLocaleString('fr-EU', {style: 'currency', currency: 'EUR'})}\n\n
                \`\`\`Achats\`\`\`
                \`1️⃣\` => Remplir Encres (${printerManager.printerInk >= printerManager.printerLimitInk ? 'Full' : `${(printerManager.printerLimitInk-printerManager.printerInk) * 8} Coins`})\n
                \`2️⃣\` => Remplir Papiers (${printerManager.printerPaper >= printerManager.printerLimitPaper ? 'Full' : `${(printerManager.printerLimitPaper-printerManager.printerPaper) * 8} Coins`})\n
                \`3️⃣\` => Charger Batteries (${printerManager.printerBattery >= printerManager.printerLimitBattery ? 'Full' : `${(printerManager.printerLimitBattery-printerManager.printerBattery) * 10} Coins`})\n\n
                \`4️⃣\` => ${!printerManager.printerStatus ? 'Allumé le printer' : 'Eteindre le printer\n'}\n
                \`5️⃣\` => Récupère l'argent (${printerManager.printerBank.toLocaleString('fr-EU', {
            style: 'currency',
            currency: 'EUR',
        })})`,
        thumbnail: {
            url: 'https://cdn.discordapp.com/attachments/807610082586132520/811785984026869760/image-removebg-preview.png'
        }
    }
}