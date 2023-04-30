module.exports = {
    name: "shop",
    aliases: ["boutique"],
    category: "coins",
    cooldown: 1000*10,
    description: "shop",
    usage: "`.shop`",
    run: async (RosaCoins, message, args) => {
        const managers = RosaCoins.managers;
        const { guildManager, userManager, printerManager } = managers.getDataUser(message);

        message.channel.send({
            embed: {
                title: 'LA BOUTIQUE | ' + message.guild.name,
                description: 'Après un achat, aucun remboursement n\'est possible.',
                fields: [
                    {
                        name: 'Voici les arcticles:',
                        value: `\n**Article 1 - Création de team [ 10 000 Coins ]**
                        Crée votre propre team, gerez la pour être le numéro 1 du serveur.\n
                        **Article 2 - Achat printer [ 25 000 Coins ]**
                        Vous permets de gagner de l'argent sans rien n'avoir a faire.`
                    }
                ]
            }
        }).then(message_ => {
            const collector = message_.createReactionCollector((reaction, user) => ["1️⃣", "2️⃣"].includes(reaction.emoji.name) && user.id === message.author.id, {max: 1, time: 30000})
            message_.react("1️⃣"); message_.react("2️⃣");
            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === "1️⃣") {
                    if (!userManager) return message.reply("Tu n'est pas dans la db.");
                    if (userManager.teamName) return message.reply("Tu es dans une team !")
                    if (userManager.coins < 10000) return message.reply(" vous n'avez pas assez d'argent...");
                    message.guild.channels.create(`shop-${Math.random()}`, {
                        type: 'text',
                        permissionOverwrites: [
                            {
                                id: message.guild.roles.everyone.id,
                                deny: 'VIEW_CHANNEL'
                            },
                            {
                                id: message.author.id,
                                allow: 'VIEW_CHANNEL'
                            }
                        ]
                    }).then(textChannel => {
                        message.channel.send(`**Merci pour votre achat, cliquez sur ce salon pour finaliser votre commande** [${textChannel}]`)
                        textChannel.send({
                            embed: {
                                title: "**Entrez le nom que vous désirez pour votre team **",
                                footer: {
                                    text: 'Vous avez 5 minutes pour entrer le nom.'
                                }
                            }
                        })
                        textChannel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 300000})
                            .then(async collected => {
                                const roleName = collected.first().content;
                                if (!roleName || roleName.length < 1) return textChannel.send("**Erreur lors de la commande, veuillez contacter un technicien**");

                                const dataTeam = managers.getDataTeam(message, {teamName: roleName});

                                if (dataTeam.teamManager) return textChannel.send("**Erreur lors de la commande, veuillez contacter un technicien**, (team existante !)");
                                textChannel.send({
                                    embed: {
                                        title: "**Entrez le code hex de la couleur que vous désirez pour votre team **",
                                        description: "FAQ: \n **Où trouvez le code hex des couleurs ?** - __https://www.color-hex.com/__ \n \n **IMPORTANT:**",
                                        footer: {
                                            text: `Vous avez 5 minutes pour entrer le code hex.`
                                        }
                                    }
                                })

                                textChannel.awaitMessages(m => m.author.id === message.author.id, {max: 1, time: 300000})
                                    .then(collected => {
                                        const roleColor = collected.first().content;
                                        if (!roleColor || roleColor.length < 1) return textChannel.send("**Erreur lors de la commande, veuillez contacter un technicien**");
                                        if (!(/^#([0-9A-F]{3}){1,2}$/i.test((roleColor.startsWith("#") ? roleColor : `#${roleColor}`).replace(/ /g, '')))) return textChannel.send("**Erreur lors de la commande, veuillez contacter un technicien**")
                                        message.guild.roles.create({
                                            data: {
                                                name: roleName,
                                                color: roleColor.replace(/#/, '').replace(/ /g, '')
                                            }
                                        }).then(async role => {
                                            let member = message.guild.members.cache.get(user.id)
                                            member.roles.add(role);
                                            const textTeam = guildManager.categoryTextTeam ? await message.guild.channels.create(roleName, {
                                                type: "text",
                                                permissionOverwrites: [
                                                    {
                                                        id: message.guild.roles.everyone.id,
                                                        deny: 'VIEW_CHANNEL'
                                                    },
                                                    {
                                                        id: role.id,
                                                        allow: "VIEW_CHANNEL"
                                                    },
                                                    {
                                                        id: message.author.id,
                                                        allow: ["MANAGE_CHANNELS"]
                                                    }
                                                ],
                                                userLimit: 99,
                                                parent: guildManager.categoryTextTeam
                                            }) : null;

                                            managers.addTeam(`${message.guild.id}-${roleName}`, {
                                                guildId: message.guild.id,
                                                teamName: roleName,
                                                ownerId: message.author.id,
                                                roleId: role ? role.id : null,
                                                textId: textTeam ? textTeam.id : null
                                            })

                                            userManager.teamName = roleName;
                                            userManager.coins -= 10000;
                                            textChannel.send("**Votre commande à été finalisée**")
                                            setTimeout(() => {
                                                textChannel.delete();
                                            }, 5000)
                                        })
                                    }).catch(() => {
                                    textChannel.send("**Temps écoulé, si vous n'avez pas eu le temps veuillez contacter un technicien**");
                                    textChannel.delete();
                                })
                            })
                    })
                }else if (reaction.emoji.name === "2️⃣") {
                    if (!userManager) return message.reply("Tu n'est pas dans la db.");
                    if (printerManager) return message.reply("Tu as deja un printer !")
                    if (userManager.coins < 25000) return message.reply(" vous n'avez pas assez d'argent...");
                    managers.addPrinter(`${message.guild.id}-${message.author.id}`, {
                        guildId: message.guild.id,
                        userId: message.author.id
                    })
                    userManager.coins -= 25000;
                    message.reply("Vous venez d'acheté un printer !")
                }
            })
        })

    }
}