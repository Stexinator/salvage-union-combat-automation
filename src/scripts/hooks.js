import SalvageUnionCombatAutomationWeapons from './weapons.js';
import SalvageUnionCombatAutomationDamage from './applyDamage.js';
import SalvageUnionCombatAutomationResources from './resources.js';
import Settings from './settings.js';

Hooks.on('ready', () => {
    Settings.addAllSettings();
});

Hooks.once('init', function () {
    game.salvage = {
        ...game.salvage,
        salvageUnionCombatAutomationWeapons: SalvageUnionCombatAutomationWeapons
    };
});

Hooks.on('renderSalvageUnionActorSheet', async function (actor, html) {
    SalvageUnionCombatAutomationWeapons.addAutomationToWeapons(actor, html);
    SalvageUnionCombatAutomationResources.addAutomationToEnergyItems(actor, html);

    html.find('.su-combatautomation-combatdicebutton').on('click', ev => {
        SalvageUnionCombatAutomationWeapons.handleAttackRollButton(ev);
    });

    html.find('.su-combatautomation-resourcedicebutton').on('click', ev => {
        SalvageUnionCombatAutomationResources.handleResource(ev);
    });
});

Hooks.on('renderChatMessage', async function (message, html) {
    html.find('.su-combatautomation-damagebutton').on('click', _ => {
        SalvageUnionCombatAutomationDamage.clickDamageButton(message);
    });
    html.find('.su-combatautomation-customdamagebutton').on('click', event => {
        SalvageUnionCombatAutomationDamage.clickCustomDamageButton(message, event.currentTarget);
    });
});

Hooks.on('renderChatMessage', async function (message, html) {
    html.find('.su-combatautomation-heatcheckbutton').on('click', _ => {
        ChatMessage.create({
            content: 'Work in Progress -> Use the actor sheet',
            speaker: { alias: game.user.name }
        });
    });
});
