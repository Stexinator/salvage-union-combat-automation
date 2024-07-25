export default class SalvageUnionCombatAutomationHeat{
    static async handleHeat(hot, actor) {

        if(hot == undefined || actor.type !== "mech") {
            return true;
        }

        let heat = parseInt(actor.system.heat.value)
        let max_heat = parseInt(actor.system.heat.max)


        let heatValue = hot.match(/\d+|X/).pop()

        if(heatValue == 'X') {
            heatValue = await Dialog.prompt({
                title:  game.i18n.format("salvage-union-combat-automation.heat-dialog.title"),
                content: game.i18n.format("salvage-union-combat-automation.heat-dialog.heat-produced") + '<input type="number">',
                callback: (html) => html.find('input').val()
            });
            
        }

        heatValue = parseInt(heatValue);

        if((heat + heatValue) > max_heat) {
            ui.notifications.error(game.i18n.format("salvage-union-combat-automation.too-much-heat"))
            return false;
        }

        if((heat + heatValue) == max_heat) {
            this.handleHeatspike(actor)
        }

        actor.update({ 'system.heat.value': heat + heatValue });
        
        return true;
    }

    static async handleHeatspike(actor) {
        if(actor.system.heat?.value) {
            game.salvage.heatRoll(actor.system.heat.value)
        }
        return true;
    }
}