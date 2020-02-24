const config = require('../config');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const moment = require('moment-timezone');

const { ComponentDialog, WaterfallDialog, TextPrompt, ActivityPrompt, ChoicePrompt, DialogTurnStatus} = require('botbuilder-dialogs');

const UBICACION_DIALOG = "UBICACION_DIALOG";
const TEXT_PROMPT = "TEXT_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const ACTIVITY_PROMPT = 'ACTIVITY_PROMPT';
const CHOICE_PROMPT = "CHOICE_PROMPT";

class UbicacionDialog extends ComponentDialog{
    constructor(){
        super(UBICACION_DIALOG);

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ActivityPrompt(ACTIVITY_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.ubicacionStep.bind(this),
            this.guardarStep.bind(this)
            
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async ubicacionStep(step) {
        console.log("[ubicacionDialog]: ubicacionStep");
        const details = step.options;
       await step.context.sendActivity('**Comparte tu ubicación**');
       return { status: DialogTurnStatus.waiting };
}
    

    async guardarStep(step) {
        console.log("[ubicacionDialog]: guardarStep");

        const details = step.options;
        if(step.context.activity.entities){
            const entities = step.context.activity.entities;
            details.entities = entities;
            console.log('_ENTITIES', details.entities);
            console.log('_GEO', details.entities[0].geo);
            console.log('_LATITUD', details.entities[0].geo.latitude);
            moment.locale('es');
            const cdmx = moment().tz("America/Mexico_City");
            const now = new Date();
                now.setHours(now.getHours()-5);
            const dateNow = now.toLocaleString();
            
            const entidad = {
                PartitionKey : {'_': details.asociado, '$':'Edm.String'},
                RowKey : {'_': details.serie, '$':'Edm.String'},
                GPS: {'_': cdmx.format('LLL') +' '+ 'https://www.google.com.mx/maps/search/'+ details.entities[0].geo.latitude + "," + details.entities[0].geo.longitude+'\n' + details.gps, '$':'Edm.String'},
                Latitud: {'_': details.entities[0].geo.latitude, '$':'Edm.String'},
                Longitud: {'_': details.entities[0].geo.longitude, '$':'Edm.String'}
            };
        
            const merge = new Promise((resolve, reject) => {
                // Update Comentarios Azure
                tableSvc.mergeEntity(config.table1, entidad, function (error, result, response) {
                    if (!error) {
                        resolve(
                            console.log(`GPS actualizado en Azure`)
                            );
                    } else {
                        reject(error);
                    }
                });
            });
            await merge;
            await step.context.sendActivity(`**Se ha guardado tu ubicación.**` );
            return await step.endDialog();
        }
    else{
        return await step.beginDialog(UBICACION_DIALOG, details);
    }



}
}
module.exports.UbicacionDialog = UbicacionDialog;
module.exports.UBICACION_DIALOG = UBICACION_DIALOG;