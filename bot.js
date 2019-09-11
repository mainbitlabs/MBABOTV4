// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const config = require('./config');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ActivityHandler } = require('botbuilder');

class MyBot extends ActivityHandler {
/**
 * @param {ConversationState} conversationState
 * @param {UserState} userState
 * @param {Dialog} dialog
 */  
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            console.log('_Running dialog with Message Activity.');
            console.log('_TEXT', context.activity.text);
            // if(context.activity.entities){
                // const entities = context.activity.entities;
                // config.entities = entities;
                // console.log('_ENTITIES', config.entities);
                // console.log('_GEO', config.entities[0].geo);
                // console.log('_LATITUD', config.entities[0].geo.latitude);
            // const now = new Date();
            //     now.setHours(now.getHours()-5);
            // const dateNow = now.toLocaleString();
            
        //     const entidad = {
        //     PartitionKey : {'_': config.asociado, '$':'Edm.String'},
        //     RowKey : {'_': config.serie, '$':'Edm.String'},
        //     GPS: {'_': dateNow +' '+ 'https://www.google.com.mx/maps/search/'+ config.entities[0].geo.latitude + "," + config.entities[0].geo.longitude+'\n' + config.gps, '$':'Edm.String'}

        // };
        
        // const merge = new Promise((resolve, reject) => {
        //     // Update Comentarios Azure
        //     tableSvc.mergeEntity(config.table1,entidad, function (error, result, response) {
        //         if (!error) {
        //             resolve(
        //                 console.log(`Incidente de ${config.incidente} actualizado en Azure`)
        //                 );
        //         } else {
        //             reject(error);
        //         }
        //     });
        // });
                // await context.sendActivity(`Entities latitud:${config.entities[0].geo.latitude}, longitud:latitud:${config.entities[0].geo.longitude} ` );

            // }
            // else{
                
            // }
            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }
}

module.exports.MyBot = MyBot;
