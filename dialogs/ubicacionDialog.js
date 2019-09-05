const { ComponentDialog, WaterfallDialog, TextPrompt, ActivityPrompt, ChoicePrompt, ChoiceFactory } = require('botbuilder-dialogs');

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
        console.log("[UBICACION_DIALOG]: ubicacionStep");
        return await step.prompt(CHOICE_PROMPT, {
            prompt: '**Por favor comparte tu ubicación**',
            choices: ChoiceFactory.toChoices([''])
        });
    }
    async guardarStep(step) {
        console.log(step.context.activity);
     await step.context.sendActivity('Gracias, hemos guardado tu ubicación.');
     return await step.endDialog();
    }

}
module.exports.UbicacionDialog = UbicacionDialog;
module.exports.UBICACION_DIALOG = UBICACION_DIALOG;