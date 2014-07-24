var dataDir = require("sdk/self").data;
var noti = require("sdk/notifications");
var panels = require("sdk/panel");
var request = require("sdk/request");
var sp = require("sdk/simple-prefs");
var ss = require("sdk/simple-storage").storage;
var tabs = require("sdk/tabs");

var sysver = parseInt(require("sdk/system").version);
var wid = 0;
var workers = {};
var reqs = {};




if (require("sdk/self").loadReason !== "startup" && sp.prefs.toCurr === "") showOptions();

if (!ss.currRates) ss.currRates = {};
if (!ss.currRatesLT) ss.currRatesLT = {};

// if an exchange rate is older than 1 day, delete it
for (var i in ss.currRatesLT) {
	if (Date.now() - ss.currRatesLT[i] > 86400000) {
		if (ss.currRates.hasOwnProperty(i)) delete ss.currRates[i];
		delete ss.currRatesLT[i];
	}
}




var btnIcons = {
	on: {
		"16": dataDir.url("icon16.png"),
		"32": dataDir.url("icon32.png"),
		"48": dataDir.url("icon48.png")
	},
	off: {
		"16": dataDir.url("icon16_off.png"),
		"32": dataDir.url("icon32_off.png"),
		"48": dataDir.url("icon48_off.png")
	}
};

var button;
// add toggle button
if (sysver >= 29) {
	button = require("sdk/ui").ToggleButton({
		id: "scsccbtn",
		label: "SCs Currency Converter",
		icon: (sp.prefs.btn) ? btnIcons.on : btnIcons.off,
		onChange: function(state) {
			if (state.checked) {
				if (sysver >= 30) panel.show({ position: this });
				else panel.show();
			}
			else panel.hide();
		}
	});

}
// or add widget
else {
	button = require("sdk/widget").Widget({
		id: "scsccbtn",
		label: "SCs Currency Converter",
		contentURL: (sp.prefs.btn) ? btnIcons.on["32"] : btnIcons.off["32"],
		onClick: function() {
			panel.show();
		}
	});
}




var panel = panels.Panel({
	width: 250,
	position: { top: 5, right: 30 },
	contentURL: dataDir.url("panel.html"),
	onShow: function() {
		this.port.emit("showPanel", sp.prefs.toCurr);
	},
	onHide: function() {
		if (sysver >= 29 && button.state("window").checked) {
			if (sysver >= 30) button.state("window", { checked: false });
			else require("sdk/timers").setTimeout(function() { button.state("window", { checked: false }); }, 300);
		}
	}
});

panel.port.on("loaded", panelFirstRun);

function panelFirstRun() {
	panel.port.emit("firstRun", [ ss.currRates, ss.currRatesLT, sp.prefs.btn, sp.prefs.toCurr ]);
	panel.port.removeListener("loaded", panelFirstRun);
}

panel.port.on("panelHeight", function(data) {
	panel.height = data;
	
	if (panel.height > 400) panel.height = 400;
});

panel.port.on("turnOnOff", function() {
	if (sp.prefs.btn) {
		if (sysver >= 29) button.icon = btnIcons.off;
		else button.contentURL = btnIcons.off["32"];
		sp.prefs.btn = false;
	}
	else {
		if (sysver >= 29) button.icon = btnIcons.on;
		else button.contentURL = btnIcons.on["32"];
		sp.prefs.btn = true;
	}
});

panel.port.on("options", function() {
	showOptions();
	panel.hide();
});

panel.port.on("resCurrRates", function() {
	ss.currRates = {};
	ss.currRatesLT = {};
	
	sendData("CurrRates", tabs.activeTab.id);
});




require("sdk/page-mod").PageMod({
	include: "*",
	contentScriptWhen: "end",
	contentScriptFile: dataDir.url("scscc.js"),
	attachTo: ["existing", "top", "frame"],
	onAttach: function(worker) {
		workers[wid] = {};
		workers[wid].worker = worker;
		workers[wid].uPrefsChanged = false;
		workers[wid].currRatesChanged = false;
		wid++;
		
		worker.port.emit("firstRun", [ sp.prefs, ss.currRates ]);
		
		worker.port.on("getCurrRates", function(data) {
			var fromCurr = data[0];
			var toCurr = data[1];
			
			// if a request for this exchange rate runs already, return 
			if (reqs[fromCurr + "to" + toCurr + "runs"]) return;
			
			// if last request was within an hour, return
			if (ss.currRatesLT.hasOwnProperty(fromCurr + "to" + toCurr) && Date.now() - ss.currRatesLT[fromCurr + "to" + toCurr] < 3600000) return;
			
			// else start request
			reqs[fromCurr + "to" + toCurr + "runs"] = true;
			getCurrRate(fromCurr, toCurr, worker.tab.id);
		});
		
		worker.on("detach", function() {
			for (var id in workers) {
				if (workers[id].worker === this) {
					delete workers[id];
					return;
				}
			}
		});
	}
});

// refresh marked workers on tab activate
tabs.on("activate", function(tab) {
	for (var id in workers) {
		if (workers[id].worker.tab && workers[id].worker.tab.id === tab.id) {
			if (workers[id].uPrefsChanged) {
				workers[id].uPrefsChanged = false;
				// catch: The page is currently hidden and can no longer be used until it is visible again.
				try {
					workers[id].worker.port.emit("refreshUPrefs", sp.prefs);
				}
				catch (err) {
					console.log("SCsCC - send prefs error: " + err.message);
				}
			}
			if (workers[id].currRatesChanged) {
				workers[id].currRatesChanged = false;
				// catch: The page is currently hidden and can no longer be used until it is visible again.
				try {
					workers[id].worker.port.emit("refreshCurrRates", ss.currRates);
				}
				catch (err) {
					console.log("SCsCC - send currrates error: " + err.message);
				}
			}
		}
	}
});

// preference change listener
sp.on("", function(prefName) {
	// if notification preference changed, skip
	if (prefName === "noti") return;
	
	// on action button state change refresh the active tab immediately
	if (prefName === "btn") {
		sendData("UPrefs", tabs.activeTab.id);
		
		return;
	}
	
	// change the symbol on currency change
	if (prefName === "toCurr") {
		sp.prefs.symbol = sp.prefs[prefName];
	}
	
	// if a space inserted before the symbol, remove it, and set symbSep to true
	if (prefName === "symbol" && (sp.prefs.symbol.charAt(0) === " " || sp.prefs.symbol.charAt(sp.prefs.symbol.length - 1) === " ")) {
		if (!sp.prefs.symbSep) sp.prefs.symbSep = true;
		sp.prefs.symbol = sp.prefs.symbol.trim(); //sp.prefs.symbol.slice(1);
	}
	
	// don't let to set the same thousand and decimal separator
	if ((prefName === "sepTho" || prefName === "sepDec") && sp.prefs.sepTho === sp.prefs.sepDec) {
		if (prefName === "sepTho" && sp.prefs.sepTho.trim() !== "") {
			sp.prefs.sepDec = (sp.prefs.sepTho === ",") ? "." : ",";
		}
		else {
			sp.prefs.sepTho = (sp.prefs.sepDec === ",") ? "." : ",";
		}
	}
	
	sendData("UPrefs", false);
});

// reset exchange rates button listener
sp.on("resCurrRates", function() {
	ss.currRates = {};
	ss.currRatesLT = {};
	
	sendData("CurrRates", false);
});




function showOptions() {
	require("sdk/window/utils").getMostRecentBrowserWindow().BrowserOpenAddonsMgr("addons://detail/" + encodeURIComponent(require("sdk/self").id) + "/preferences");
}

// get and update the exchange rate of the requested currencies
function getCurrRate(fromCurr, toCurr, tabid) {
	reqs[fromCurr + "to" + toCurr + "req"] = request.Request({
		url: "http://www.google.com/search?q=1%20" + fromCurr + "%20to%20" + toCurr,
		onComplete: function(response) { reqComplete(response, fromCurr, toCurr, tabid); }
	}).get();
};

// on getCurrRate request complete
function reqComplete(response, fromCurr, toCurr, tabid) {
	var rc, rt;
	
	console.log("SCsCC - get " + fromCurr + " to " + toCurr);
	
	if (response.status === 200) {
		ss.currRatesLT[fromCurr + "to" + toCurr] = Date.now();
		
		rt = response.text.match(/id=["']?exchange_rate["']?(?:\s+type=["']?hidden["']?)?\s+value=["']?(\d+\.\d+)/i);
		
		if (rt && rt.hasOwnProperty(1)) {
			
			rc = parseFloat(rt[1]);
			
			// if match is not a number
			if (isNaN(rc)) {
				reqs[fromCurr + "to" + toCurr + "runs"] = false;
				
				console.log("SCsCC - got text, but not a number");
				
				return;
			}
			
			// return if exchange rate didn't change (no refresh)
			if (rc === ss.currRates[fromCurr + "to" + toCurr]) {
				panel.port.emit("refreshCurrRates", [ ss.currRates, ss.currRatesLT ]);
				
				reqs[fromCurr + "to" + toCurr + "runs"] = false;
				
				console.log("SCsCC - got " + fromCurr + " to " + toCurr + ", exchange rate didn't change", 
					ss.currRates[fromCurr + "to" + toCurr], 
					new Date(ss.currRatesLT[fromCurr + "to" + toCurr]).toUTCString());
				
				return;
			}
			
			// show notification about exchange rate updates if enabled in preferences
			if (sp.prefs.noti) {
				// on update
				if (ss.currRates.hasOwnProperty(fromCurr + "to" + toCurr)) {
					noti.notify({
						title: "SCs Currency Converter",
						text: fromCurr + " to " + toCurr + " exchange rate updated:\n" 
								+ ss.currRates[fromCurr + "to" + toCurr] + " → " + rc,
						iconURL: dataDir.url("icon48.png")
					});
				}
				// on frist get
				else {
					noti.notify({
						title: "SCs Currency Converter",
						text: fromCurr + " → " + toCurr + " exchange rate got:\n" + rc,
						iconURL: dataDir.url("icon48.png")
					});
				}
			}
			
			console.log("SCsCC - got " + fromCurr + " to " + toCurr + ":", 
				ss.currRates[fromCurr + "to" + toCurr], "->", rc,
				new Date(ss.currRatesLT[fromCurr + "to" + toCurr]).toUTCString());
			
			ss.currRates[fromCurr + "to" + toCurr] = rc;
			
			sendData("CurrRates", tabid);
		}
		else {
			console.log("SCsCC - got text, but regex match failed");
		}
	}
	else {
		// will try again if requested after 10 minues
		ss.currRatesLT[fromCurr + "to" + toCurr] = Date.now() - 3000000;
		
		console.log("SCsCC - get error:", response.statusText, response.status);
	}
	
	reqs[fromCurr + "to" + toCurr + "runs"] = false;
}

function sendData(what, tabid) {
	var changed, data, refresh;
	
	refresh = "refresh" + what;
	data = (what === "UPrefs") ? sp.prefs : ss.currRates;
	changed = (what === "UPrefs") ? "uPrefsChanged" : "currRatesChanged";
	
	for (var id in workers) {
		if (tabid && workers[id].worker.tab && workers[id].worker.tab.id === tabid) {
			// catch: The page is currently hidden and can no longer be used until it is visible again.
			try {
				workers[id].worker.port.emit(refresh, data);
			}
			catch (err) {
				console.log("SCsCC - send " + what + " error: " + err.message);
			}
		}
		else {
			workers[id][changed] = true;
		}
	}
	
	if (what === "CurrRates") panel.port.emit("refreshCurrRates", [ ss.currRates, ss.currRatesLT ]);
}