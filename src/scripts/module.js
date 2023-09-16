Hooks.on('renderSalvageUnionActorSheet', async function(actor, html) {

    SalvageUnionCombatAutomation.addAutomationToWeapons(actor, html)

    html.find('.su-combatautomation-dicebutton').on('click', ev => {
        SalvageUnionCombatAutomation.handleAttackRollButton(ev);
    })
});


class SalvageUnionCombatAutomation{

    static addAutomationToWeapons(actor, html) {
        let weapons = this.getAllWeapons(actor)
        this.addButtonToWeapons(weapons, html)
    }

    static getAllWeapons(sheet) {
        let actor = sheet.object

        let systems = actor?.system?.systems || [];
        let equipments = actor?.system?.equipment || [];
        let abilities = actor?.system?.abilities || [];

        let weapons = systems.concat(equipments).concat(abilities).filter(system => system.system.damage && system.system.damage != "")

        return weapons;
    }

    static addButtonToWeapons( weapons, html) {
        const weaponHtmls = weapons.reduce((acc, weapon) => {
            const node = html.find(`h2.item-context-menu.title[data-item-id="${weapon._id}"]`);
            if(node) {
                acc.push({node: node, uuid: weapon.uuid});
            } 
            return acc;
          }, []);

          weaponHtmls.forEach(entry => {
            entry.node.append(
                this.createAttackRollButton( entry.uuid)
              );
          });
    }

    static createAttackRollButton( weaponId) {
        const tooltip = game.i18n.localize('salvage-union-combat-automation.attackRoll');

        return `<small><button type='button' title='${tooltip}' class="su-combatautomation-dicebutton" weapon-uuid='${weaponId}'><i class="fas fa-dice-d20"></i></button></small>`
    }

    static async handleAttackRollButton(ev) {
        let weapon = await fromUuid(ev.currentTarget.attributes['weapon-uuid'].value)

        let rollTable = (await game.packs.get("salvage-union-combat-automation.su-combat-automation-rolltable").getDocuments()).find(table => table.name == "Weapon Attack")

        let result = await rollTable.roll()

        let traits = weapon.system.traits.join(" // ")

        const messageTemplate = 'modules/salvage-union-combat-automation/templates/attack.hbs'
        const templateContext = {
            name: weapon.name,
            target: game.user.targets?.first()?.document.name ?? game.i18n.localize('salvage-union-combat-automation.no-target'),
            result: result.results[0],
            system: weapon.system,
            traits: traits,
            roll: result.roll,
            activeStatus: CONFIG.SALVAGE.statusTypes.ACTIVE,
            noTarget: game.user.targets?.first()?.document.name == null
          }
      
        const content = await renderTemplate(messageTemplate, templateContext)
        const chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            roll: result.roll,
            content: content,
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        }

        let message = await ChatMessage.create(chatData)

        message.setFlag('salvage-union-combat-automation', 'damage', weapon.system.damage)
        message.setFlag('salvage-union-combat-automation', 'target', game.user.targets?.first()?.actor.uuid)
    }
}