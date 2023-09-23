export default class SalvageUnionCombatAutomationDamage{

    static async applyDamage(message) {

        let damage = message.getFlag('salvage-union-combat-automation', 'damage')
        let target = await fromUuid(message.getFlag('salvage-union-combat-automation', 'target'))

        if(target.system.sp) {
           this.applyDamageToSp(target, damage)
        }
        else {
            this.applyDamageToHp(target, damage)
        }

        ChatMessage.create({ 
            content:  game.i18n.format("salvage-union-combat-automation.apply-damage", {damage: damage, name: target.name}), 
            speaker: { alias: game.user.name } 
        });
        
    }

    static async applyDamageToSp(target, damage) {
        let damageNumber = damage.match(/\d+/).pop();

        if(damage.includes("HP")) {
            damageNumber = Math.floor(damageNumber*0.5);
        }

        let newSp = target.system.sp.value - damageNumber;
        target.update({ 'system.sp.value': newSp });

        if(newSp <= 0) {
            this.markDefeated(target)
        }
    }

    static async applyDamageToHp(target, damage) {
        let damageNumber = damage.match(/\d+/).pop();

        if(damage.includes("SP") && target.system.healthType !== 'sp') {
            damageNumber = damageNumber*2;
       }

       let newHp = target.system.hp.value - damageNumber;
       target.update({ 'system.hp.value': newHp });

       if(newHp <= 0) {
        this.markDefeated(target)
       }
    }

    static async markDefeated(target) {
        let token = target.token
        await token.combatant.update({defeated:true});
        const status = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.DEFEATED);

        const effect = token.actor && status ? status : CONFIG.controlIcons.defeated;
        await token.object.toggleEffect(effect, {overlay: true, active: true});
    }
}
