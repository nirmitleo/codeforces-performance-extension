chrome.runtime.onInstalled.addListener(function () {
    var a = 1;
    console.log('hi');
    chrome.contextMenus.create({
        "id": "sampleContextMenu",
        "title": "Sample Context Menu",
        "contexts": ["selection"]
    });
});
