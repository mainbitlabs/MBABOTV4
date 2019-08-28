const { ComponentDialog, WaterfallDialog, TextPrompt, DateTimePrompt } = require('botbuilder-dialogs');

const UBICACION_DIALOG = "UBICACION_DIALOG";
const TEXT_DIALOG = "TEXT_DIALOG";
const waterfal = "waterfal"

class UbicacionDialog extends ComponentDialog{
    constructor(){
        super(UBICACION_DIALOG);
        this.initialDialogId = UBICACION_DIALOG;

        this.addDialog(new TextPrompt(TEXT_DIALOG));

        this.addDialog(new WaterfallDialog(waterfal, [
            this.ubicacionStep.bind(this),
            this.guardarStep.bind(this),
        ]));
    }

    async ubicacionStep(step) {
        // await step.context.sendActivity('Por favor comparte tu ubicación');
        return await step.prompt(
            TEXT_DIALOG, {
                prompt: 'Please enter your destination'
            }
            );
    }
    async guardarStep(step) {
     const guardar = step.result;
     await step.context.sendActivity('Gracias, hemos guardado tu ubicación.');
     return await step.endDialog();
    }

}
module.exports.UbicacionDialog = UbicacionDialog;
module.exports.UBICACION_DIALOG = UBICACION_DIALOG;