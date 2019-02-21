document.onmouseup = document.onkeyup = document.onselectionchange = function () {
    var content = window.getSelection().toString();

    if (content && content.length < 15) {
        chrome.storage.local.set({ content: content });
    } else {
        chrome.storage.local.set({ content: null });
    }
};