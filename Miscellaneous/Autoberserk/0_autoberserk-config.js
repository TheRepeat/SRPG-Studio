var AutoberserkConfig = {
    aiPrefersBerserkWeapon: true,               // if true, AI will always try to attack using their autoberserk weapon
    defaultRemoveBerserkOnWeaponBreak: true,    // if true, autoberserk is removed when the problem weapon breaks (Note: this refers to the DEFAULT from which individual weapons' custom parameters can differ)
    revertAtMapEnd: true                        // if true, berserked units are reverted from ally->player at map end. If false, berserked units are removed from the party at map end (not *technically* dead but a similar effect)
};

