
# FoundryVTT Module

- Adds buttons to weapons, equipment and abilities with damage or resource cost
- When targeted the output can apply the damage to the target via a button

## Changelog
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