export default class SalvageUnionCombatAutomationDamage{

    static async clickDamageButton(message) {

        let damage = message.getFlag('salvage-union-combat-automation', 'damage')
        let target = await fromUuid(message.getFlag('salvage-union-combat-automation', 'target'))

        this.applyDamage(target, damage)
    }

    static async clickCustomDamageButton(message, button) {

        let damage = message.getFlag('salvage-union-combat-automation', 'damage')
        let target = await fromUuid(message.getFlag('salvage-union-combat-automation', 'target'))

        let modifier = button.dataset.value;

        this.applyDamage(target, damage, modifier);        
    }

    static async applyDamage(target, damage, modifier) {
        if(!target) {
            return;
        }

        let damageNumber;
        
        if(target.system.healthType.includes("sp")) {
            damageNumber = await this.applyDamageToSp(target, damage, modifier)
        }
        else {
            damageNumber = await this.applyDamageToHp(target, damage, modifier)
        }

        ChatMessage.create({ 
            content:  game.i18n.format("salvage-union-combat-automation.apply-damage", {damage: damage + (modifier? ' ' + modifier + ' ('+damageNumber+')' : '' ), name: target.name}), 
            speaker: { alias: game.user.name } 
        });
        
    }

    static async applyDamageToSp(target, damage, modifier) {
        let damageNumber = parseInt(damage.match(/\d+/).pop());

        if(modifier) {
            if(modifier.includes('*') ||modifier.includes('x')) {
                damageNumber *= parseInt(modifier.match(/\d+/).pop());
            }
            else if(modifier.includes('/')) {
                damageNumber = Math.floor(damageNumber /parseInt(modifier.match(/\d+/).pop()));
            }
            else {
                damageNumber += parseInt(modifier);
            }
        }

        if(damage.includes("HP")) {
            damageNumber = Math.floor(damageNumber*0.5);
        }

        let newSp;
        if(target.system.sp?.value) {
            newSp = target.system.sp.value - damageNumber;
            target.update({ 'system.sp.value': newSp });
        }
        else {
            newSp = target.system.hp.value - damageNumber;
            target.update({ 'system.hp.value': newSp });
        }


        if(newSp <= 0) {
            this.markDefeated(target)
        }

        return damageNumber;
    }

    static async applyDamageToHp(target, damage, modifier) {
        let damageNumber = damage.match(/\d+/).pop();

        if(modifier) {
            if(modifier.includes('*')) {
                damageNumber *= parseInt(modifier.match(/\d+/).pop());
            }
            else if(modifier.includes('/')) {
                damageNumber /= Math.floor(parseInt(modifier.match(/\d+/).pop()));
            }
            else {
                damageNumber += parseInt(modifier);
            }
        }

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
        await token?.combatant?.update({defeated:true});
        const status = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.DEFEATED);

        const effect = token.actor && status ? status : CONFIG.controlIcons.defeated;
        await token.object.toggleEffect(effect, {overlay: true, active: true});
    }
}
