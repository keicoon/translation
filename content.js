document.onmouseup = document.onkeyup = document.onselectionchange = function () {
    try {
        var selected = window.getSelection().toString();

        if (selected && selected.length < 15) {
            console.log('set', selected)
            chrome.storage.local.set({ content: selected });
        }
    } catch (e) {
        alert(e);
    }
};