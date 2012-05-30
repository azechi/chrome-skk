(function() {

function updateComposition(skk) {
    if (!skk.entries) {
        return;
    }

    var entry = skk.entries.entries[skk.entries.index];
    if (!entry) {
        skk.clearComposition();
    }

    var preedit = '\u25bc' + entry.word;
    if (entry.annotation) {
        preedit += ';' + entry.annotation;
    }
    skk.setComposition(preedit, 1, preedit.length, preedit.length,
                       [{start:0, end:1, style:'underline'}]);
}

function initConversion(skk) {
    skk.lookup(skk.preedit, function(entries) {
        skk.entries = {index:0, entries:entries};
        if (entries.length == 0) {
            return;
        }
        updateComposition(skk);
    });
}

function conversionMode(skk, keyevent) {
    if (keyevent.key == ' ') {
        skk.entries.index++;
        if (skk.entries.index >= skk.entries.entries.length) {
            // recursive word registration...
            skk.entries.index = 0;
        }
    } else if (keyevent.key == 'x') {
        skk.entries.index--;
        if (skk.entries.index < 0) {
            skk.entries = null;
            skk.switchMode('preedit');
        }
    } else if (keyevent.key == 'shift' || keyevent.key == 'alt' ||
               keyevent.key == 'ctrl') {
        // do nothing.
    } else {
        skk.commitText(skk.entries.entries[skk.entries.index].word);
        skk.clearComposition();
        if (keyevent.key == '>') {
            skk.preedit = '>';
            skk.entries = null;
            skk.switchMode('preedit');
        } else {
            skk.preedit = '';
            skk.entries = null;
            skk.switchMode('hiragana');
            skk.handleKeyEvent(keyevent);
        }
    }
}

skk.registerMode('conversion', {
    keyHandler: conversionMode,
    initHandler: initConversion,
    compositionHandler: updateComposition
});
})()