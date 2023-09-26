export default class SalvageUnionCombatAutomationHeat{
    static async handleHeat(hot, actor) {

        if(hot == undefined) {
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
            let message = await ChatMessage.create({ 
                content:  game.i18n.format("salvage-union-combat-automation.heat-check-required") +
                '<button type="button" class="su-combatautomation-heatcheckbutton">'+game.i18n.format("salvage-union-combat-automation.buttons.heatcheck")+'</button>', 
                speaker: { alias: game.user.name } 
            });

            message.setFlag('salvage-union-combat-automation', 'heat', (heat + heatValue))
            console.log(message)
        }

        actor.update({ 'system.heat.value': heat + heatValue });
        
        return true;
    }

    static async handeHeatspike() {
        
    }
}