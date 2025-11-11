
function WMAUT_percent_of_highest_zone(percent) {
    return Math.floor((getHighestLevelCleared(false, true) + 1) * (percent / 100));
    // "false, true" is "use current universe, obey Obsidian cap".
}

function WMAUT_DE_count() {
    let maxCost = getTotalTalentCost();
	let talentCount = countPurchasedTalents();
	let maxTalents = Object.keys(game.talents).length;
	if (game.global.spentEssence + game.global.essence > maxCost || talentCount == maxTalents) {
        return "<p>You have bought all Masteries!</p>"
    }
    let cur_ess = game.global.essence;
    let next_ess = getNextTalentCost()
    let de_text = "<p>You have <b>"
    de_text += prettify(cur_ess)
    de_text += "</b> essence; your next Mastery costs "
    de_text += prettify(next_ess)
    de_text += ". (<b>"
    de_text += prettify(next_ess - cur_ess)
    de_text += "</b> essence needed)</p>"
    return de_text;
}

function WMAUT_MS_count() {
    let cur_seed = game.global.mutatedSeeds;
    let next_seed = u2Mutations.nextCost();
    let ms_text = "<p>You have <b>"
    ms_text += prettify(cur_seed)
    ms_text += "</b> seeds; your next Mutation costs "
    ms_text += prettify(next_seed)
    ms_text += ". (<b>"
    ms_text += prettify(next_seed - cur_seed)
    ms_text += "</b> seeds needed)</p>"
    return ms_text
}

function WMAUT_blacksmithery_text() {
    let percent = 50;
    if (game.talents.blacksmith2.purchased) { // own BS2
        percent = 75;
    }
    if (game.talents.blacksmith3.purchased) { // own BS3
        percent = 90;
    }
    let zonecap = WMAUT_percent_of_highest_zone(percent);
    return "<p>Blacksmithery is currently applying through zone " + zonecap + ".</p>"
}

function WMAUT_hyperspeed_text() {
    let zonecap = WMAUT_percent_of_highest_zone(50);
    return "<p>Hyperspeed 2 is currently applying through zone " + zonecap + ".</p>"
}

function WMAUT_improve_tooltips() {
    let elem = document.getElementById("talentsTab");
    if (elem == null) {
        return
    }
    let tooltiptext = "";

    // tab is invisible before u1z181+, so no if clause is necessary on that front.
    tooltiptext += WMAUT_DE_count();
    if (game.global.highestRadonLevelCleared >= 200) { // reached u2z201+
        tooltiptext += WMAUT_MS_count();
    }
    if (game.talents.blacksmith.purchased) { // own BS1
        tooltiptext += WMAUT_blacksmithery_text();
    }
    if (game.talents.hyperspeed2.purchased) { // own HyS2 (HyS1 is entirely pointless to give message about because it doesn't end)
        tooltiptext += WMAUT_hyperspeed_text();
    }

    let tooltipmode = (game.global.tabForMastery) ? "Mastery" : "Mutators";
    let tooltipfull = "tooltip('" + tooltipmode + "', 'customText', event, '" + tooltiptext + "')";
    elem.setAttribute('onmouseover', tooltipfull);
}

function WMAUT_initialise() {
    WMAUT_improve_tooltips();
    setInterval( function () {
        WMAUT_improve_tooltips();
    }, 1000);
}
WMAUT_initialise();
