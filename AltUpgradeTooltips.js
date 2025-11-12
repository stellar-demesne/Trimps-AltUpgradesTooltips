
function WMAUT_extra_ess_multipliers() {
    let multiplier = 1;
    if (game.global.challengeActive == "Daily") {
        multiplier *= (1 + (getDailyHeliumValue(countDailyWeight()) / 100));
    }
    if (game.global.spiresCompleted >= 1) {
        multiplier *= Math.pow(4, game.global.spiresCompleted);
    }
    return multiplier;
}

function WMAUT_extra_ess_Scryhard(zone) {
    if (game.talents.scry.purchased) {
        // calculate number of healthy/corrupt cells
        // (note that Healthy cells strictly replace Corrupt cells, so that makes no difference)
        let start = 181;
        if (game.talents.headstart3.purchased) {
            start = 151
        }
        else if (game.talents.headstart2.purchased) {
            start = 166
        }
        else if (game.talents.headstart.purchased) {
            start = 176
        }
        let corr_cells = Math.min(80, 2 + Math.floor((zone - start) / 3));
        // now that we have number of cells, each cell would give 1.5 times DE
        // that's equal to 1 + (.5 * (cor_cells / 100))
        // but we can simplify that a bit to not do both a mult and a div.
        return 1 + (.005 * corr_cells)
    }
    // if we don't *have* scryhard, we don't have this *problem*.
    return 1
}

function WMAUT_predict_ess_per_zone(zone) {
    if (zone < 181) {
        return 0;
    }
    let scrypow = 1.1683885 // the game's code suggests a 4.0 compatibility version using 1.11613. i don't care.
    let ess_per_drop = Math.max(1, Math.pow(scrypow, zone - 180))
    // three drops per zone, multipliers and flooring happens per drop.
    let ess_per_zone = Math.floor(ess_per_drop * WMAUT_extra_ess_Scryhard(zone) * WMAUT_extra_ess_multipliers()) * 3;
    return ess_per_zone;
}

function WMAUT_predict_ess_up_to_zone(zone) {
    let sum = 0;
    for (let loop_zone = 181; loop_zone <= zone; loop_zone++) {
        sum += WMAUT_predict_ess_per_zone(loop_zone);
    }
    return sum;
}

function WMAUT_predict_zone_for_ess(ess) {
    // TODO: we are failing to control for Scryhard 1 here, as yet.

    // first, we assume we're getting the boosted essence from dailies/spire/etc, so we must divide target by the boost.
    let actual_target_ess = ess / WMAUT_extra_ess_multipliers();
    // 6.93.. is a manual estimation; 0.155.. = log(scrypow) = log(1.1683885)
    let zone_guess = Math.log(actual_target_ess / 6.93864) / 0.15562544896332595
    return zone_guess + 181;
}

function WMAUT_extra_seed_multipliers() {
    let multiplier = 1;
    if (game.global.desoCompletions > 0) {
        multiplier *= game.challenges.Desolation.getTrimpMult();
    }
    if (game.global.challengeActive == "Daily") {
        multiplier *= (1 + (getDailyHeliumValue(countDailyWeight()) / 100));
    }
    if (Fluffy.isRewardActive("bigSeeds")) {
        multiplier *= 10;
    }
    if (game.heirlooms.Staff.SeedDrop.currentBonus > 0) {
      multiplier *= (1 + (scaleHeirloomModUniverse("Staff", "SeedDrop", game.heirlooms.Staff.SeedDrop.currentBonus) / 100));
    }
    if (u2SpireBonuses.seedDrop() > 1) {
        multiplier *= u2SpireBonuses.seedDrop();
    }
    return multiplier;
}

function WMAUT_predict_seeds_per_zone(zone) {
    // this acts like its a Raging zone, but the result is correct regardless of mutation type.
    // however... TODO: there's no consideration given for Super Mutations, yet.
    let count = 5 + Math.floor((zone - 201) / 5);
    let value_per = zone - 199;
    let num_muts = Math.min(4, Math.floor((zone - 151) / 50));
    return Math.min(count, 60) * value_per * num_muts * WMAUT_extra_seed_multipliers();
}

function WMAUT_bruteforce_zones_for_seeds(seeds_needed) {
    // TODO: is there a less iteration-y method of calc'ing this?
    let seeds_seen = 0;
    let zone_target = 200;
    while (seeds_seen < seeds_needed) {
        zone_target++;
        seeds_seen += WMAUT_predict_seeds_per_zone(zone_target)
    }
    return zone_target;
}

function WMAUT_percent_of_highest_zone(percent) {
    return Math.floor((getHighestLevelCleared(false, true) + 1) * (percent / 100));
    // "false, true" is "use current universe, obey Obsidian cap".
}

function WMAUT_check_bought_all_masteries() {
    let maxCost = getTotalTalentCost();
	let talentCount = countPurchasedTalents();
	let maxTalents = Object.keys(game.talents).length;
	return game.global.spentEssence + game.global.essence > maxCost || talentCount == maxTalents
}

function WMAUT_DE_count() {
    let cur_ess = game.global.essence;
    let next_ess = getNextTalentCost()
    let de_text = "<p>You have <b>"
    de_text += prettify(cur_ess)
    de_text += "</b> essence; your next Mastery costs "
    de_text += prettify(next_ess)
    de_text += ". (<b>"
	if (next_ess - cur_ess < 0) {
        de_text += "You can afford another "
        let aff_count = checkAffordableTalents() - countPurchasedTalents();
        if (aff_count > 1) {
            de_text += aff_count + " Masteries!</b>"
        }
        else {
            de_text += "Mastery!</b>"
        }
    }
    else {
        de_text += prettify(next_ess - cur_ess)
        de_text += "</b> essence needed, estimated to be gained maybe around z" + WMAUT_predict_zone_for_ess(next_ess - cur_ess);
    }
    de_text += ")</p>"
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
    if (next_seed - cur_seed < 0) {
        ms_text += "You can afford another Mutator!</b>"
    }
    else {
        ms_text += prettify(next_seed - cur_seed)
        ms_text += "</b> seeds needed, estimated to be gained maybe around z" + WMAUT_bruteforce_zones_for_seeds(next_seed - cur_seed);
    }
    ms_text += ")</p>"
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
    let tooltipmode = (game.global.tabForMastery) ? "Masteries" : "Mutators";
    let tooltiptext = "<p>Click to view your " + tooltipmode + "</p>";
    let tooltiptail = "";

    if (!WMAUT_check_bought_all_masteries()) {
    	// tab is invisible before u1z181+, so no if clause is necessary on that front.
        tooltiptext += WMAUT_DE_count();
        // however, if we've bought them all, that info can get relegated to the bottom of the tooltip.
    }
    else {
        tooltiptail += "<p>You have bought all Masteries!</p>";
    }
    if (game.global.highestRadonLevelCleared >= 200) { // reached u2z201+
        tooltiptext += WMAUT_MS_count();
    }
    if (game.talents.blacksmith.purchased || game.talents.hyperspeed2.purchased) {
        tooltiptext += "<hr>"
    }
    if (game.talents.blacksmith.purchased) { // own BS1
        tooltiptext += WMAUT_blacksmithery_text();
    }
    if (game.talents.hyperspeed2.purchased) { // own HyS2 (HyS1 is entirely pointless to give message about because it doesn't end)
        tooltiptext += WMAUT_hyperspeed_text();
    }

    let tooltipfull = "tooltip('" + tooltipmode + "', 'customText', event, '" + tooltiptext + tooltiptail + "')";
    elem.setAttribute('onmouseover', tooltipfull);
}

function WMAUT_initialise() {
    WMAUT_improve_tooltips();
    setInterval( function () {
        WMAUT_improve_tooltips();
    }, 1000);
}
WMAUT_initialise();
