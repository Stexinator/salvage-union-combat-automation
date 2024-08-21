export default class Settings {
    static addAllSettings() {
        game.settings.register('salvage-union-combat-automation', 'customDamageButtons', {
            name: 'salvage-union-combat-automation.settings.customDamageButtons',
            scope: 'world',
            config: game.user.isGM,
            type: String,
            default: 'x2; /2; +2'
        });
    }
}
