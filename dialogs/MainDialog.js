const config = require('../config');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const azureTS = require('azure-table-storage-async');

// Dialogos
const { UbicacionDialog, UBICACION_DIALOG } = require('./ubicacionDialog');
const { DocsDialog, DOCS_DIALOG } = require('./DOCS');
const { IncidentDialog, INCIDENT_DIALOG } = require('./IncidentDialog');


const { ChoiceFactory, ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, ListStyle} = require('botbuilder-dialogs');

const MAIN_DIALOG = 'MAIN_DIALOG';
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const USER_PROFILE = "USER_PROFILE";
const WATERFALL_DIALOG = "WATERFALL_DIALOG";






class MainDialog extends ComponentDialog {
    /**
     * SampleBot defines the core business logic of this bot.
     * @param {ConversationState} conversationState A ConversationState object used to store dialog state.
     */
    constructor(userState){
        super(MAIN_DIALOG);

        this.userProfile = userState.createProperty(USER_PROFILE);
        this.addDialog(new DocsDialog());
        this.addDialog(new IncidentDialog());
        this.addDialog(new UbicacionDialog());
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.serieStep.bind(this),
            this.asociadoStep.bind(this),
            this.infoConfirmStep.bind(this),
            this.dispatcher.bind(this),
            this.choiceDialog.bind(this)

        ]));
        this.initialDialogId = WATERFALL_DIALOG;


    }
/**
 * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
 * If no dialog is active, it will start the default dialog.
 * @param {*} turnContext
 * @param {*} accessor
 */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async serieStep(step){
       await step.context.sendActivity('Recuerda que este bot tiene un tiempo limite de 10 minutos.');
       return await step.prompt(TEXT_PROMPT, `Por favor, **escribe el Número de Serie del equipo.**`);
    }

    async asociadoStep(step) {
        console.log(step
            
            );
        
        step.values.serie = step.result;
        return await step.prompt(TEXT_PROMPT, `¿Cual es tu **clave de asociado**?`);
    }
    async infoConfirmStep(step) {
        step.values.asociado = step.result;
        const parkey = step.values.asociado;
        const rowkey = step.values.serie;
        // console.log(step.values);
        
        const result = await azureTS.retrieveEntityAsync(tableSvc,config.table1, parkey, rowkey);

        config.asociado = result.PartitionKey._;
        config.serie = result.RowKey._;
        config.proyecto = result.Proyecto._;
        config.pospuesto = result.Pospuesto._;
        config.servicio = result.Servicio._;
        config.localidad = result.Localidad._;
        config.inmueble = result.Inmueble._;
        config.usuario = result.NombreUsuario._;
        config.area = result.Area._;
        config.baja = result.Baja._;
        config.borrado = result.Borrado._;
        config.check = result.Check._;
        config.hoja = result.HojaDeServicio._;
        config.resguardo = result.Resguardo._;
    
        const msg=(`**Proyecto:** ${result.Proyecto._} \n\n **Número de Serie**: ${result.RowKey._} \n\n **Asociado:** ${result.PartitionKey._}  \n\n  **Descripción:** ${result.Descripcion._} \n\n  **Localidad:** ${result.Localidad._} \n\n  **Inmueble:** ${result.Inmueble._} \n\n  **Servicio:** ${result.Servicio._} \n\n  **Resguardo:** ${result.Resguardo._} \n\n  **Check:** ${result.Check._} \n\n  **Borrado:** ${result.Borrado._} \n\n  **Baja:** ${result.Baja._} \n\n  **Hoja de Servicio:** ${result.HojaDeServicio._}`);
        
        await step.context.sendActivity(msg);
        return await step.prompt(CHOICE_PROMPT, {
            prompt: '**¿Esta información es correcta?**',
            choices: ChoiceFactory.toChoices(['Sí', 'No']),
            style: ListStyle.list
        });
    }
    async dispatcher(step) {
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

    async choiceDialog(step) {
        const answer = step.result.value;
        if (!answer) {
            // exhausted attempts and no selection, start over
            await step.context.sendActivity('Not a valid option. We\'ll restart the dialog ' +
                'so you can try again!');
            return await step.endDialog();
        }
        if (answer ==='Ubicación') {
            return await step.beginDialog(UBICACION_DIALOG);
        } 
        if (answer ==='Documentación') {
            return await step.beginDialog(DOCS_DIALOG);
        } 
        if (answer ==='Incidente') {
            return await step.beginDialog(INCIDENT_DIALOG);
        } 
    return await stepContext.endDialog();

    }
}

module.exports.MainDialog = MainDialog;