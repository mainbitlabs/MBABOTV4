const config = require('../config');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt } = require('botbuilder-dialogs');
const moment = require('moment-timezone');

const INCIDENT_DIALOG = "INCIDENT_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class IncidentDialog extends ComponentDialog {
    constructor(){
        super(INCIDENT_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.choiceStep.bind(this),
            this.incidenteStep.bind(this),
            this.correoStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async choiceStep(step) {
        console.log('[IncidentDialog]: choiceStep');

        return await step.prompt(CHOICE_PROMPT, {
            prompt: '**Elije el motivo por el cual se pospone el servicio.**',
            choices: ChoiceFactory.toChoices(['Documentos', 'Servicio', 'Usuario', 'Infraestructura', 'Equipo'])
        });
    }

    async incidenteStep(step) {
        console.log('[IncidentDialog]: incidenteStep');
        const details = step.options;
        const incidente = step.result.value;
        details.incidente = incidente;

        const now = new Date();
        const dateNow = now.toLocaleString();
        now.setHours(now.getHours()-5);
        return await step.prompt(TEXT_PROMPT,`Escribe tus observaciones`);
    }

    async correoStep(step) {
        console.log('[IncidentDialog]: correoStep');
        moment.locale('es');
        const cdmx = moment().tz("America/Mexico_City");
        const details = step.options;
        console.log(details.proyecto);
        const motivos = step.result;
        details.motivos = motivos;

        const now = new Date();
        now.setHours(now.getHours()-5);
        const dateNow = now.toLocaleString();
        
        const entidad = {
            PartitionKey : {'_': details.asociado, '$':'Edm.String'},
            RowKey : {'_': details.serie, '$':'Edm.String'},
            Pospuesto : {'_': cdmx.format('LLL') +' '+ details.incidente +' '+ details.motivos+'\n'+ details.pospuesto, '$':'Edm.String'}
        };
        
        const merge = new Promise((resolve, reject) => {
            // Update Comentarios Azure
            tableSvc.mergeEntity(config.table1, entidad, function (error, result, response) {
                if (!error) {
                    resolve(
                        console.log(`Incidente de ${details.incidente} actualizado en Azure`)
                        );
                } else {
                    reject(error);
                }
            });
        });

        const email = new Promise((resolve, reject) => {
            nodeoutlook.sendEmail({
                auth: {
                    user: `${config.email1}`,
                    pass: `${config.pass}`,
                }, from: `${config.email1}`,
                to: `${config.email1}, ${config.email2}, ${config.email3}, ${config.email4}`,
                subject: `${details.proyecto} Incidente de ${details.incidente}: ${details.serie} / ${details.servicio}`,
                html: `<p>El servicio se pospuso por el siguiente motivo:</p> <br> <b>${details.incidente}</b> <br> <b><blockquote>${details.motivos}</blockquote></b> <br> <b>Proyecto: ${details.proyecto}</b>  <br> <b>Serie: ${details.serie}</b> <br> <b>Servicio: ${details.servicio}</b> <br> <b>Localidad: ${details.localidad}</b> <br> <b>Inmueble: ${details.inmueble}</b> <br> <b>Nombre de Usuario: ${details.usuario}</b> <br> <b>Area: ${details.area}</b>`,
                onError: (e) => reject(console.log(e)),
                onSuccess: (i) => resolve(console.log(i))
                
            }
            
            );
            
        });
        await merge;
        await email;
        await step.context.sendActivity('Hemos concluido por ahora, tus comentarios serán enviados por correo.');
        // TERMINA EL DIÁLOGO
           return await step.endDialog();
    }
}
module.exports.IncidentDialog = IncidentDialog;
module.exports.INCIDENT_DIALOG = INCIDENT_DIALOG;