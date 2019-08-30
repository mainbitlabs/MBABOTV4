const { ComponentDialog, WaterfallDialog, TextPrompt, ActivityPrompt } = require('botbuilder-dialogs');

const UBICACION_DIALOG = "UBICACION_DIALOG";
const TEXT_PROMPT = "TEXT_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const ACTIVITY_PROMPT = 'ACTIVITY_PROMPT';

class UbicacionDialog extends ComponentDialog{
    constructor(){
        super(UBICACION_DIALOG);

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ActivityPrompt(ACTIVITY_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.ubicacionStep.bind(this),
            this.guardarStep.bind(this)
            
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async ubicacionStep(step) {
        console.log("[UBICACION_DIALOG]: ubicacionStep");
        
        // await step.context.sendActivity('Por favor comparte tu ubicación');
        return await step.prompt(
            ACTIVITY_PROMPT, {
                prompt: 'Comparte tu ubicación'
            }
            );
    }
    async guardarStep(step) {
        console.log(step);
        
     const guardar = step.result;
     await step.context.sendActivity('Gracias, hemos guardado tu ubicación.');
     return await step.endDialog();
    }

}
module.exports.UbicacionDialog = UbicacionDialog;
module.exports.UBICACION_DIALOG = UBICACION_DIALOG;