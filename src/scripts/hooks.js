import SalvageUnionCombatAutomationWeapons from "./weapons.js"
import SalvageUnionCombatAutomationDamage from "./damage.js"
import SalvageUnionCombatAutomationResources from "./resources.js"

Hooks.on('renderSalvageUnionActorSheet', async function(actor, html) {

    SalvageUnionCombatAutomationWeapons.addAutomationToWeapons(actor, html)
    SalvageUnionCombatAutomationResources.addAutomationToEnergyItems(actor, html)

    html.find('.su-combatautomation-combatdicebutton').on('click', ev => {
        SalvageUnionCombatAutomationWeapons.handleAttackRollButton(ev);
    })

    html.find('.su-combatautomation-energydicebutton').on('click', ev => {
        SalvageUnionCombatAutomationResources.handleResource(ev);
    })
});

Hooks.on('renderChatMessage', async function(message, html){
    html.find('.su-combatautomation-damagebutton').on('click', _ => {
        SalvageUnionCombatAutomationDamage.applyDamage(message);
    })
});

Hooks.on('renderChatMessage', async function(message, html){
    html.find('.su-combatautomation-heatcheckbutton').on('click', _ => {
        ChatMessage.create({ 
            content:  'Work in Progress -> Use the actor sheet', 
            speaker: { alias: game.user.name } 
        });
    })
});