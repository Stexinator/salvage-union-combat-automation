export default class SalvageUnionCombatAutomationResources{

    static addAutomationToEnergyItems(actor, html) {
        let items = this.getAllItems(actor)
        this.addButtonToItems(items, html)
    }

    static getAllItems(sheet) {
        let actor = sheet.object

        let systems = actor?.system?.systems || [];
        let equipments = actor?.system?.equipment || [];
        let abilities = actor?.system?.abilities || [];

        let items = systems.concat(equipments).concat(abilities).filter(system => (system.system.ep && system.system.ep != "") || system.system.ap && system.system.ap != "")

        return items;
    }

    static addButtonToItems( items, html) {
        const htmls = items.reduce((acc, item) => {
            const node = html.find(`h2.item-context-menu.title[data-item-id="${item._id}"]`);
            if(node) {
                acc.push({node: node, uuid: item.uuid});
            } 
            return acc;
          }, []);

          htmls.forEach(entry => {
            entry.node.append(
                this.createRollButton(entry.uuid)
              );
          });
    }

    static createRollButton(itemId) {
        const tooltip = game.i18n.localize('salvage-union-combat-automation.energyRoll');

        return `<small><button type='button' title='${tooltip}' class="su-combatautomation-energydicebutton" item-uuid='${itemId}'><i class="fas fa-dice-d20"></i></button></small>`
    }

    static async handleResource(ev) {

        let item = await fromUuid(ev.currentTarget.attributes['item-uuid'].value)
        let actor = item.actor

        this.handleEnergy(item, actor)
        this.handleAp(item, actor)

    }

    static async handleEnergy(item, actor) {
        let energy = item.system.ep

        if(energy == undefined) {
            return;
        }

        let energypoints = parseInt(actor.system['energy-points'].value)

        let value = energy.match(/\d+|X/).pop()

        if(value == 'X') {
            value = await Dialog.prompt({
                title:  game.i18n.format("salvage-union-combat-automation.energy-dialog.title"),
                content: game.i18n.format("salvage-union-combat-automation.energy-dialog.energy-spent") + '<input type="number">',
                callback: (html) => html.find('input').val()
            });
        }

        value = parseInt(value);

        if((energypoints - value) < 0) {
            ui.notifications.error(game.i18n.format("salvage-union-combat-automation.too-less-energy"))
            return;
        }

        let rollTable = item.system.table
        let result = await rollTable?.roll()

        const messageTemplate = 'modules/salvage-union-combat-automation/templates/item.hbs'
        const templateContext = {
            item: item,
            roll: result?.roll,
            result: result?.results[0],
            ep: value
            }
        
        const content = await renderTemplate(messageTemplate, templateContext)
        const chatData = {
            user: game.user._id,
            content: content,
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        }

        await ChatMessage.create(chatData)

        actor.update({ 'system.energy-points.value': energypoints - value });
    }

    static async handleAp(item, actor) {
        let ap = item.system.ap

        if(ap == undefined) {
            return;
        }

        let abilitypoints = parseInt(actor.system['ability-points'].value)

        let value = ap.match(/\d+|X/).pop()

        if(value == 'X') {
            value = await Dialog.prompt({
                title:  game.i18n.format("salvage-union-combat-automation.ability-dialog.title"),
                content: game.i18n.format("salvage-union-combat-automation.ability-dialog.ap-spent") + '<input type="number">',
                callback: (html) => html.find('input').val()
            });
            
        }

        value = parseInt(value);
        console.log(value)

        if((abilitypoints - value) < 0) {
            ui.notifications.error(game.i18n.format("salvage-union-combat-automation.too-less-ap"))
            return;
        }

        let rollTable = item.system.table
        let result = await rollTable?.roll()

        const messageTemplate = 'modules/salvage-union-combat-automation/templates/item.hbs'
        const templateContext = {
            item: item,
            roll: result?.roll,
            result: result?.results[0],
            ap: value
            }
          
        const content = await renderTemplate(messageTemplate, templateContext)
        const chatData = {
            user: game.user._id,
            content: content,
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        }
    
            await ChatMessage.create(chatData)

        actor.update({ 'system.ability-points.value': abilitypoints - value });
    }
}