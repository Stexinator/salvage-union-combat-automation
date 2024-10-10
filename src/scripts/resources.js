export default class SalvageUnionCombatAutomationResources {
    static addAutomationToEnergyItems(actor, html) {
        let items = this.getAllItems(actor);
        this.addButtonToItems(items, html);
    }

    static getAllItems(sheet) {
        let actor = sheet.object;

        let systems = actor?.system?.systems || [];
        let modules = actor?.system?.modules || [];
        let equipments = actor?.system?.equipment || [];
        let abilities = actor?.system?.abilities || [];

        let items = systems
            .concat(modules)
            .concat(equipments)
            .concat(abilities)
            .filter(
                item =>
                    (item.system.ep && item.system.ep != '') ||
                    (item.system.ap && item.system.ap != '') ||
                    (item.system.uses.max && item.system.uses.max != 0 && !item.system.damage)
            );

        return items;
    }

    static addButtonToItems(items, html) {
        const htmls = items.reduce((acc, item) => {
            const node = html.find(`h2.item-context-menu.title[data-item-id="${item.id}"]`);
            if (node) {
                acc.push({ node: node, uuid: item.uuid });
            }
            return acc;
        }, []);

        htmls.forEach(entry => {
            entry.node.append(this.createRollButton(entry.uuid));
        });
    }

    static createRollButton(itemId) {
        const tooltip = game.i18n.localize('salvage-union-combat-automation.energyRoll');

        return `<small><button type='button' title='${tooltip}' class="su-combatautomation-resourcedicebutton" item-uuid='${itemId}'><i class="fas fa-dice-d20"></i></button></small>`;
    }

    static async handleResource(ev) {
        let item = await fromUuid(ev.currentTarget.attributes['item-uuid'].value);
        let actor = item.actor;

        this.handleEnergy(item, actor);
        this.handleAp(item, actor);
        this.handleUses(item);
    }

    static async handleEnergy(item, actor) {
        let energy = item.system.ep;

        if (energy == undefined || actor.type == 'npc-mech') {
            return;
        }

        let energypoints = parseInt(actor.system['energy-points'].value);

        let value = energy.match(/\d+|X/).pop();

        if (value == 'X') {
            value = await Dialog.prompt({
                title: game.i18n.format('salvage-union-combat-automation.energy-dialog.title'),
                content:
                    game.i18n.format('salvage-union-combat-automation.energy-dialog.energy-spent') +
                    '<input type="number">',
                callback: html => html.find('input').val()
            });
        }

        value = parseInt(value);

        if (energypoints - value < 0) {
            ui.notifications.error(game.i18n.format('salvage-union-combat-automation.too-less-energy'));
            return;
        }

        this.createChatMessage(item, { ep: value });

        actor.update({ 'system.energy-points.value': energypoints - value });
    }

    static async handleAp(item, actor) {
        let ap = item.system.ap;

        if (ap == undefined || actor.type == 'npc') {
            return;
        }

        let abilitypoints = parseInt(actor.system['ability-points'].value);

        let value = ap.match(/\d+|X/).pop();

        if (value == 'X') {
            value = await Dialog.prompt({
                title: game.i18n.format('salvage-union-combat-automation.ability-dialog.title'),
                content:
                    game.i18n.format('salvage-union-combat-automation.ability-dialog.ap-spent') +
                    '<input type="number">',
                callback: html => html.find('input').val()
            });
        }

        value = parseInt(value);

        if (abilitypoints - value < 0) {
            ui.notifications.error(game.i18n.format('salvage-union-combat-automation.too-less-ap'));
            return;
        }

        this.createChatMessage(item, { ap: value });

        actor.update({ 'system.ability-points.value': abilitypoints - value });
    }

    static async handleUses(item) {
        if (item.system.uses.max == 0) {
            return;
        }

        if (item.system.uses.value == 0) {
            ui.notifications.error(game.i18n.format('salvage-union-combat-automation.no-uses-left'));
            return;
        }

        this.createChatMessage(item);

        item.update({ 'system.uses.value': item.system.uses.value - 1 });
    }

    static async handleUsesWeapon(item) {
        if (item.system.uses.max == 0) {
            return true;
        }

        if (item.system.uses.value == 0) {
            ui.notifications.error(game.i18n.format('salvage-union-combat-automation.no-uses-left'));
            return false;
        }

        item.update({ 'system.uses.value': item.system.uses.value - 1 });

        return true;
    }

    static async createChatMessage(item, options = null) {
        let rollTable = item.system.table;
        let result = await rollTable?.roll();

        const messageTemplate = 'modules/salvage-union-combat-automation/templates/item.hbs';
        const templateContext = {
            item: item,
            roll: result?.roll,
            result: result?.results[0],
            ap: options?.ap,
            ep: options?.ep
        };

        const content = await renderTemplate(messageTemplate, templateContext);
        const chatData = {
            user: game.user.id,
            content: content,
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_STYLES.ROLL ?? CONST.CHAT_MESSAGE_TYPES.ROLL
        };
        chatData.flags = {
            SalvageUnion: {
                item: item
            }
        };

        await ChatMessage.create(chatData);
    }
}


