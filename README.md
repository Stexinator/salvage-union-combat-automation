
# FoundryVTT Module

- Adds buttons to weapons, equipment and abilities with damage
- When targeted the output can apply the damage to the target via a button

## Changelog

0.0.19
- output heat check when maximum heat due to usage

0.0.17
- added handling for pilots with SP
- skip heat spikes for npc mechs
- (heat spikes for player mechs are working since 0.0.16)

0.0.16
- add ability to add custom buttons for combat
  - you can find this option under settings
  - you need to separate each entry with , oder ;


0.0.15
- do not inform player that items without uses do not have any uses left

0.0.12
- support uses
- fix npc-mech heat check

0.0.10
- add modules to automation

0.0.8
- added automatic deduction for ep and ap
    - when costs of X the chat output will replace x with actual value

0.0.7
- added automatic heat increase
    - when Hot(X) the player is queried for a number
    - when usage would increase heat over maximum, the roll is aborted and error is shown
    - when usage increases to maximum a heat check message is put into chat (WIP)
- added message when damage is applied to target