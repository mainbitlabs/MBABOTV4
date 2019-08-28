const config = require('../config');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const azureTS = require('azure-table-storage-async');
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt } = require('botbuilder-dialogs');

const { UserProfile } = require('../userProfile');

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
        const incidente = step.result.value;
        config.incidente = incidente;

        const now = new Date();
        const dateNow = now.toLocaleString();
        now.setHours(now.getHours()-5);
        return await step.prompt(TEXT_PROMPT,`Escribe tus observaciones`);
    }

    async correoStep(step) {
        console.log(config.proyecto);
        const motivos = step.result;
        config.motivos = motivos;

        const email = new Promise((resolve, reject) => {
            nodeoutlook.sendEmail({
                auth: {
                    user: `${config.email1}`,
                    pass: `${config.pass}`,
                }, from: `${config.email1}`,
                to: `${config.email3}`,
                subject: `${config.proyecto} Incidente de ${config.incidente}: ${config.serie} / ${config.servicio}`,
                html: `<p>El servicio se pospuso por el siguiente motivo:</p> <br> <b>${config.incidente}</b> <br> <b><blockquote>${config.motivos}</blockquote></b> <br> <b>Proyecto: ${config.proyecto}</b>  <br> <b>Serie: ${config.serie}</b> <br> <b>Servicio: ${config.servicio}</b> <br> <b>Localidad: ${config.localidad}</b> <br> <b>Inmueble: ${config.inmueble}</b> <br> <b>Nombre de Usuario: ${config.usuario}</b> <br> <b>Area: ${config.area}</b>`,
                onError: (e) => reject(console.log(e)),
                onSuccess: (i) => resolve(console.log(i))
    
            }
            
            );
            
        });
      await email;
      await step.context.sendActivity('Hemos concluido por ahora, tus comentarios serán enviados por correo.');
           return await step.endDialog();
    }
}
module.exports.IncidentDialog = IncidentDialog;
module.exports.INCIDENT_DIALOG = INCIDENT_DIALOG;