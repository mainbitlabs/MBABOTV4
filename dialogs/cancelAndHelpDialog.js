// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// var config = require('../config');
const { ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');
const {ActivityTypes} = require ('botbuilder');

/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
class CancelAndHelpDialog extends ComponentDialog {

    async onContinueDialog(step) {
        const result = await this.interrupt(step);

        if (result) {
            return result;
        }
        return await super.onContinueDialog(step);
    }


    async interrupt(step) {
        if (step.context.activity.text) {
            console.log(step.context.activity.text);
            
            const text = step.context.activity.text.toLowerCase();
    
            switch (text) {
                case 'ayuda':
                    console.log('[cancelAndHelpDialog]: interrupt - "ayuda" ');
                    const mainbit = { type: ActivityTypes.Message };
                    mainbit.attachments = [this.getMainbit()];
                    mainbit.text = 'Hola, puedo ayudarte a enviar documentación, checar tu entrada al inmueble y enviar incidentes sobre el servicio.'
                    await step.context.sendActivity(mainbit);
                    return { status: DialogTurnStatus.waiting };
                    
                case 'bot':
                    console.log('[cancelAndHelpDialog]: interrupt - "bot" ');

                    const bot = { type: ActivityTypes.Message };
                   bot.attachments = [this.getBot()];
                    bot.text = 'Hola, puedo ayudarte a enviar documentación, checar tu entrada al inmueble y enviar incidentes sobre el servicio.'
                    await step.context.sendActivity(bot);
                    return { status: DialogTurnStatus.waiting };
                     
                case 'cancel':
                case 'cancelar':
                case 'salir':
                    console.log('[cancelAndHelpDialog]: interrupt - "cancelar" ');

                    await step.context.sendActivity('Cancelando...');
                    return await step.cancelAllDialogs();

                case 'help':
                case '?':
                    await step.context.sendActivity('[ This is where to send sample help to the user... ]');
                    return { status: DialogTurnStatus.waiting };
            }
        } else {
            
        }
    }
    getBot(){
        return {
            name:'BOT',
            contentType: 'image/gif',
            contentUrl: 'https://raw.githubusercontent.com/esanchezlMBT/images/master/BOT.gif'
        }
    }
    getMainbit(){
        return {
            name:'mainbit',
            contentType: 'image/jpg',
            contentUrl: 'https://raw.githubusercontent.com/esanchezlMBT/images/master/mainbit.jpg'
        }
    }

}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
