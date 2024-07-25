import SalvageUnionCombatAutomationHeat from "./heat.js"
import SalvageUnionCombatAutomationResources from "./resources.js"


export default class SalvageUnionCombatAutomationWeapons {

    static addAutomationToWeapons(actor, html) {
        let weapons = this.getAllWeapons(actor)
        this.addButtonToWeapons(weapons, html)
    }

    static getAllWeapons(sheet) {
        let actor = sheet.object

        let systems = actor?.system?.systems || [];
        let equipments = actor?.system?.equipment || [];
        let abilities = actor?.system?.abilities || [];

        let weapons = systems.concat(equipments).concat(abilities).filter(item => item.system.damage && item.system.damage != "")

        return weapons;
    }

    static addButtonToWeapons(weapons, html) {
        const weaponHtmls = weapons.reduce((acc, weapon) => {
            const node = html.find(`h2.item-context-menu.title[data-item-id="${weapon._id}"]`);
            if (node) {
                acc.push({ node: node, uuid: weapon.uuid });
            }
            return acc;
        }, []);

        weaponHtmls.forEach(entry => {
            entry.node.append(
                this.createAttackRollButton(entry.uuid)
            );
        });
    }

    static createAttackRollButton(weaponId) {
        const tooltip = game.i18n.localize('salvage-union-combat-automation.attackRoll');

        return `<small><button type='button' title='${tooltip}' class="su-combatautomation-combatdicebutton" weapon-uuid='${weaponId}'><i class="fas fa-dice-d20"></i></button></small>`
    }

    static async handleAttackRollButton(ev) {
        let weapon = await fromUuid(ev.currentTarget.attributes['weapon-uuid'].value)

        let rollTable = (await game.packs.get("salvage-union-combat-automation.su-combat-automation-rolltable").getDocuments()).find(table => table.name == "Weapon Attack")

        let result = await rollTable.roll()

        let traits = weapon.system.traits.join(" // ")

        if (await this.handleTraits(weapon)) {
            const messageTemplate = 'modules/salvage-union-combat-automation/templates/attack.hbs'
            const templateContext = {
                name: weapon.name,
                target: game.user.targets?.first()?.document.name ?? game.i18n.localize('salvage-union-combat-automation.no-target'),
                result: result.results[0],
                system: weapon.system,
                traits: traits,
                roll: result.roll,
                activeStatus: CONFIG.SALVAGE.statusTypes.ACTIVE,
                noTarget: game.user.targets?.first()?.document.name == null,
                customButtons: game.settings.get('salvage-union-combat-automation', 'customDamageButtons').replace(',', ';').split(';')
            }

            const content = await renderTemplate(messageTemplate, templateContext)
            const chatData = {
                speaker: ChatMessage.getSpeaker({ actor: weapon.actor }),
                roll: result.roll,
                content: content,
                sound: CONFIG.sounds.dice,
                type: CONST.CHAT_MESSAGE_STYLES.ROLL,
            }
            ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));

            let message = await ChatMessage.create(chatData)

            message.setFlag('salvage-union-combat-automation', 'damage', weapon.system.damage)
            message.setFlag('salvage-union-combat-automation', 'target', game.user.targets?.first()?.actor.uuid)
        }
    }

    static async handleTraits(weapon) {
        let checks = []

        if (weapon.system.traits.filter(trait => trait.includes('Hot').length > 0)) {
            let hot = weapon.system.traits.filter(trait => trait.includes('Hot'))[0]
            checks.push(SalvageUnionCombatAutomationHeat.handleHeat(hot, weapon.actor))
        }

        if (weapon.system.traits.includes('Heat Spike')) {
            checks.push(SalvageUnionCombatAutomationHeat.handleHeatspike(weapon.actor))
        }

        if (weapon.system.traits.filter(trait => trait.includes('Uses').length > 0)) {
            checks.push(SalvageUnionCombatAutomationResources.handleUsesWeapon(weapon))
        }


        return (await Promise.all(checks)).every(check => check);
    }

}