const config = require('../config');
const azurest = require('azure-storage');
const blobService = azurest.createBlobService(config.storageA,config.accessK);

const { ComponentDialog, WaterfallDialog} = require('botbuilder-dialogs');

const DOCS_DIALOG = "DOCS_DIALOG";

class DocsDialog extends ComponentDialog {
    constructor(){

        super(DOCS_DIALOG);

        this.addDialog(new WaterfallDialog(DOCS_DIALOG, [
            this.attachStep.bind(this)

        ]));
        this.initialId = DOCS_DIALOG;
    }

    async attachStep(step) {
        await step.context.sendActivity('Adjunta aquí.');

    }



}
module.exports.DocsDialog = DocsDialog;
module.exports.DOCS_DIALOG = DOCS_DIALOG;