var skk_dictionary =new Dictionary();
var skk = null;

(function() {
chrome.input.ime.onActivate.addListener(function(engineID) {
  skk = new SKK(engineID, skk_dictionary);
  var menus = [{id:'skk-options',
                label:'SKK\u306E\u8A2D\u5B9A',
                style:'check'
               },
               {id:'skk-separator', style:'separator'}];
  for (var i = 0; i <skk.primaryModes.length; i++) {
    var modeName = skk.primaryModes[i];
    menus.push({id:'skk-' + modeName,
                label:skk.modes[modeName].displayName,
                style:'radio',
                checked:(modeName == 'ascii')});
  }
  chrome.input.ime.setMenuItems({engineID:engineID, items:menus});
});

chrome.input.ime.onFocus.addListener(function(context) {
  skk.context = context.contextID;
});

var ctrlKey = false 
var lastRemappedKeyEvent = undefined;

function isRemappedEvent(keyData){
  return lastRemappedKeyEvent != undefined &&
    (lastRemappedKeyEvent.key == keyData.key &&
      lastRemappedKeyEvent.code == keyData.code &&
      lastRemappedKeyEvent.type == keyData.type);
}

chrome.input.ime.onKeyEvent.addListener(function(engineID, keyData) {
  
  if (!isRemappedEvent(keyData)){
  
    if (keyData.code == "AltRight"){
      keyData.code = "ControlRight";
      keyData.key = "Ctrl";
      keyData.ctrlKey = (keyData.type == "keydown");
      ctrlKey = keyData.ctrlKey;
      keyData.altKey = false

      chrome.input.ime.sendKeyEvents({"contextID": skk.context, "keyData": [keyData]});
      lastRemappedKeyEvent = keyData;
      return true;
    } else if (ctrlKey){
      keyData.ctrlKey = ctrlKey;
      keyData.altKey = false;
      
      chrome.input.ime.sendKeyEvents({"contextID": skk.context, "keyData": [keyData]});
      lastRemappedKeyEvent = keyData;
      return true;
    
    }
  }


  
  if (keyData.type != 'keydown') { 
    return false;
  }

  return skk.handleKeyEvent(keyData);
});

chrome.input.ime.onMenuItemActivated.addListener(function(engineID, name) {
  if (name == 'skk-options') {
    window.open(chrome.extension.getURL('options.html'));
    return;
  }

  var modeName = name.slice('skk-'.length);
  skk.switchMode(modeName);
});
})();
