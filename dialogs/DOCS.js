const config = require('../config');
const azurest = require('azure-storage');
const image2base64 = require('image-to-base64');
const blobService = azurest.createBlobService(config.storageA,config.accessK);
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const DOCS_DIALOG = "DOCS_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class DocsDialog extends ComponentDialog {
    constructor(){
        super(DOCS_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.choiceStep.bind(this),
            this.adjuntaStep.bind(this),
            this.attachStep.bind(this),
            this.dispatcherStep.bind(this),
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async choiceStep(step) {
    console.log('[DocsDialog]: choiceStep');
    var optsbutton = [];
    var Opts = {};
    const query = new Promise ((resolve, reject) => {
        tableSvc.retrieveEntity(config.table4, "Proyecto", config.proyecto,function(error, result, response) {
                    if (!error) {
                        if (result.Baja._ == "X") {
                            Opts.Baja="Baja";
                            optsbutton.push(Opts.Baja);
                        }
                        if (result.Borrado._ == "X") {
                            Opts.Borrado="Borrado";
                            optsbutton.push(Opts.Borrado);
                        }
                        if (result.Check._ == "X") {
                            Opts.Check="Check";
                            optsbutton.push(Opts.Check);
                        }
                        if (result.Resguardo._ == "X") {
                            Opts.Resguardo ="Resguardo";
                            optsbutton.push(Opts.Resguardo);
                        }
                        if (result.HojaDeServicio._ == "X") {
                            Opts.Hoja ="HojaDeServicio";
                            optsbutton.push(Opts.Hoja);
                        }
                        resolve(
                            console.log(`Documentos de ${config.proyecto} encontrados en Azure`)
                        );
                    } else {
                    reject(console.log(error));
                    }
                });
            });
        await query;    
        return await step.prompt(CHOICE_PROMPT, {
            prompt: '**Que tipo de documento quieres adjuntar.**',
            choices: ChoiceFactory.toChoices(optsbutton)
        });
    }

    async adjuntaStep(step) {
        const docAttach = step.result.value;
        config.docAttach = docAttach;
        switch (docAttach) {
            case "Baja": 
                if (config.baja == "Aprobado") {
                    await step.context.sendActivity("**No puedes adjuntar el archivo, este documento ya ha sido aprobado.** \n**Hemos concluido por ahora.**");
                    return await step.endDialog();
                } else {
                    
                    return await step.prompt(ATTACH_PROMPT,`Adjunta aquí ${config.docAttach}`);
                }
            case "Borrado":
                if (config.borrado == "Aprobado") {
                    await step.context.sendActivity("**No puedes adjuntar el archivo, este documento ya ha sido aprobado.** \n**Hemos concluido por ahora.**");
                    return await step.endDialog();
                } else {
                    
                    return await step.prompt(ATTACH_PROMPT,`Adjunta aquí ${config.docAttach}`);
                }
            case "Check":
                if (config.check == "Aprobado") {
                    await step.context.sendActivity("**No puedes adjuntar el archivo, este documento ya ha sido aprobado.** \n**Hemos concluido por ahora.**");
                    return await step.endDialog();
                } else {
                    
                    return await step.prompt(ATTACH_PROMPT,`Adjunta aquí ${config.docAttach}`);
                }
                
            case "HojaDeServicio":
                if (config.hoja == "Aprobado") {
                    await step.context.sendActivity("**No puedes adjuntar el archivo, este documento ya ha sido aprobado.** \n**Hemos concluido por ahora.**");
                    return await step.endDialog();
                } else {
                    
                    return await step.prompt(ATTACH_PROMPT,`Adjunta aquí ${config.docAttach}`);
                }
            case "Resguardo":
                if (config.resguardo == "Aprobado") {
                    await step.context.sendActivity("**No puedes adjuntar el archivo, este documento ya ha sido aprobado.** \n**Hemos concluido por ahora.**");
                    return await step.endDialog();
                } else {
                    
                    return await step.prompt(ATTACH_PROMPT,`Adjunta aquí ${config.docAttach}`);
                }
                
            default:
                break;
        }

    }
    /**
     * Returns an attachment that has been uploaded to the channel's blob storage.
     * @param {Object} step
     */
    async attachStep(step) {
        console.log(step.context.activity.attachments);
        
        if (step.context.activity.attachments && step.context.activity.attachments.length > 0) {
            // The user sent an attachment and the bot should handle the incoming attachment.
            const attachment = step.context.activity.attachments[0];
            const stype = attachment.contentType.split('/');
            const ctype = stype[1];
            const url = attachment.contentUrl;
            image2base64(url)
                 .then(
                     (response) => {
                         // console.log(response); //iVBORw0KGgoAAAANSwCAIA...
                         var buffer = Buffer.from(response, 'base64');
                         const blob = new Promise ((resolve, reject) => {

                             blobService.createBlockBlobFromText(config.blobcontainer, config.proyecto +'_'+ config.serie +'_'+ config.docAttach +'_'+ config.asociado +'.'+ ctype, buffer,  function(error, result, response) {
                                 if (!error) {
                                     console.log("_Archivo subido al Blob Storage",response)
                                     resolve();
                                }       
                                else{
                                    reject(
                                        console.log('Hubo un error en Blob Storage: '+ error)
                                        );
                                        
                                    }
                                });
                                });
                                
                            }
                            )
                .catch(
                    (error) => {
                        console.log(error); //Exepection error....
                    });
                    // await blob;
                    await step.context.sendActivity(`El archivo **${config.proyecto}_${config.serie}_${config.docAttach}_${config.asociado}.${ctype}** se ha subido correctamente`);
                    return await step.prompt(CHOICE_PROMPT, {
                        prompt: '¿Deseas adjuntar Evidencia o Documentación?',
                        choices: ChoiceFactory.toChoices(['Sí','No'])
                    });
        } else {
            // Since no attachment was received, send an attachment to the user.
            await step.context.sendActivity('Por favor envía una imagen.');
        }

    }

    async dispatcherStep(step) {
        const selection = step.result.value;
        switch (selection) {
            
            case 'Sí':
                return await step.beginDialog(DOCS_DIALOG);
            case 'No':
            await step.context.sendActivity('De acuerdo, hemos terminado por ahora.');             
            // TERMINA EL DIÁLOGO
            return await step.endDialog();  
            default:
                break;
        }
    }


    

}
module.exports.DocsDialog = DocsDialog;
module.exports.DOCS_DIALOG = DOCS_DIALOG;