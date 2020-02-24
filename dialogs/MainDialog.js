const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
var config = require('../config');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const azureTS = require('azure-table-storage-async');

// Dialogos
const { UbicacionDialog, UBICACION_DIALOG } = require('./ubicacionDialog');
const { DocsDialog, DOCS_DIALOG } = require('./DOCS');
const { IncidentDialog, INCIDENT_DIALOG } = require('./IncidentDialog');


const { ChoiceFactory, ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, ListStyle} = require('botbuilder-dialogs');


const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const USER_PROFILE = "USER_PROFILE";
const WATERFALL_DIALOG = "WATERFALL_DIALOG";

class MainDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'mainDialog');
        this.addDialog(new DocsDialog());
        this.addDialog(new IncidentDialog());
        this.addDialog(new UbicacionDialog());
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.serieStep.bind(this),
            this.asociadoStep.bind(this),
            this.infoConfirmStep.bind(this),
            this.dispatcherStep.bind(this),
            this.choiceStep.bind(this)

        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

async serieStep(step){
    console.log('[mainDialog]:serieStep');
   await step.context.sendActivity('Recuerda que este bot tiene un tiempo limite de 10 minutos.');
   return await step.prompt(TEXT_PROMPT, `Por favor, **escribe el Número de Serie del equipo.**`);
}

async asociadoStep(step) {
    console.log('[mainDialog]:asociadoStep');
    const details = step.options;
    details.serie = step.result;
    return await step.prompt(TEXT_PROMPT, `¿Cual es tu **clave de asociado**?`);
}

async infoConfirmStep(step) {
    console.log('[mainDialog]:infoConfirmStep');
    const details = step.options;
    details.asociado = step.result;
    const parkey = details.asociado;
    const rowkey = details.serie;
    // console.log(details);
    
    const result = await azureTS.retrieveEntityAsync(tableSvc, config.table1, parkey, rowkey);

    details.asociado = result.PartitionKey._;
    details.serie = result.RowKey._;
    details.proyecto = result.Proyecto._;
    details.pospuesto = result.Pospuesto._;
    details.servicio = result.Servicio._;
    details.localidad = result.Localidad._;
    details.inmueble = result.Inmueble._;
    details.usuario = result.NombreUsuario._;
    details.area = result.Area._;
    details.baja = result.Baja._;
    details.borrado = result.Borrado._;
    details.check = result.Check._;
    details.hoja = result.HojaDeServicio._;
    details.resguardo = result.Resguardo._;
    details.gps = result.GPS._;

    const msg=(`**Proyecto:** ${result.Proyecto._} \n\n **Número de Serie**: ${result.RowKey._} \n\n **Asociado:** ${result.PartitionKey._}  \n\n  **Descripción:** ${result.Descripcion._} \n\n  **Localidad:** ${result.Localidad._} \n\n  **Inmueble:** ${result.Inmueble._} \n\n  **Servicio:** ${result.Servicio._} \n\n  **Resguardo:** ${result.Resguardo._} \n\n  **Check:** ${result.Check._} \n\n  **Borrado:** ${result.Borrado._} \n\n  **Baja:** ${result.Baja._} \n\n  **Hoja de Servicio:** ${result.HojaDeServicio._}`);
    
    await step.context.sendActivity(msg);
    // console.log(details);
    
    return await step.prompt(CHOICE_PROMPT, {
        prompt: '**¿Esta información es correcta?**',
        choices: ChoiceFactory.toChoices(['Sí', 'No'])
    });
}
async dispatcherStep(step) {
    console.log('[mainDialog]:dispatcherStep');

    const selection = step.result.value;
    switch (selection) {
        
        case 'Sí':
            return await step.prompt(CHOICE_PROMPT,{
                prompt:'Que deseas realizar',
                choices: ChoiceFactory.toChoices(['Ubicación', 'Documentación', 'Incidente'])
            });
        case 'No':
            return await step.context.sendActivity('Por favor valida con tu soporte que el Número de Serie esté asignado a tu Asociado.');             
                 
        default:
            break;
    }
}

async choiceStep(step) {
    console.log('[mainDialog]:choiceStep');
    const details = step.options;
    const answer = step.result.value;
    if (!answer) {
        // exhausted attempts and no selection, start over
        await step.context.sendActivity('Not a valid option. We\'ll restart the dialog ' +
            'so you can try again!');
        return await step.endDialog();
    }
    if (answer ==='Ubicación') {
        return await step.beginDialog(UBICACION_DIALOG, details);
    } 
    if (answer ==='Documentación') {
        return await step.beginDialog(DOCS_DIALOG, details);
    } 
    if (answer ==='Incidente') {
        return await step.beginDialog(INCIDENT_DIALOG, details);
    }
return await step.endDialog();

}
}

module.exports.MainDialog = MainDialog;