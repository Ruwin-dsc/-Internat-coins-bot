module.exports =  async (RosaCoins) => {
    await RosaCoins.user.setActivity("Loading . . .", {
        type: "LISTENING"
    })

    await RosaCoins.managers.loadVoice();
    await RosaCoins.managers.autoSaveVoice(1000*2.5);
    await RosaCoins.managers.autoPushToDatabase((1000 * 60)*3);
    await RosaCoins.managers.autoPrinter((1000 * 60)*7);
    await RosaCoins.managers.autoPersonnage((1000 * 10));

    await RosaCoins.user.setActivity("Dev by Morphée (BETA)", {
        type: "LISTENING"
    })
}