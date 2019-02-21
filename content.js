document.onmouseup = document.onkeyup = document.onselectionchange = function () {
    var content = window.getSelection().toString();
    chrome.storage.sync.set({ content });
};