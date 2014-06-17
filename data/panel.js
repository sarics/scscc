"use strict";

var currRates, currRatesLT, div, resBtn, state, stateBtn, to;

addon.port.once("firstRun", function(data) {
	currRates = data[0];
	currRatesLT = data[1];
	state = data[2];
	
	refreshCurrRateList();
	
	stateBtn.textContent = (state) ? "Turn off" : "Turn on";
});

addon.port.on("showPanel", function() {
	var spans = document.querySelectorAll("span.upd");
	
	for (var i = 0, len = spans.length; i < len; i++) {
		spans[i].textContent = lastUpdate(spans[i].dataset.id);
	}
	
	to = setTimeout(function() {
		addon.port.emit("panelHeight", div.clientHeight);
	}, 200);
});

addon.port.on("refreshCurrRates", function(data) {
	currRates = data[0];
	currRatesLT = data[1];
	
	refreshCurrRateList();
});




window.addEventListener("load", function() {
	div = document.querySelector("div");
	resBtn = document.querySelector("#reset");
	stateBtn = document.querySelector("#state");
	
	stateBtn.addEventListener("click", function() {
		if (state) {
			this.textContent = "Turn on";
			state = false;
		}
		else {
			this.textContent = "Turn off";
			state = true;
		}
		
		addon.port.emit("turnOnOff");
	});
	
	resBtn.addEventListener("click", function() {
		addon.port.emit("resCurrRates");
	});
	
	document.querySelector("#options").addEventListener("click", function() {
		addon.port.emit("options");
	});
	
	addon.port.emit("loaded");
});




function refreshCurrRateList() {
	var currs, li, lihtml, ul;
	
	ul = document.querySelector("ul");
	while (ul.firstChild) {
		ul.removeChild(ul.firstChild);
	}
	
	for (var id in currRates) {
		currs = id.split("to");
		
		li = document.createElement("li");
		
		// span.curr - fromCurr to toCurr:
		lihtml = document.createElement("span");
		lihtml.className = "curr";
		lihtml.textContent = currs[0] + " to " + currs[1] + ": ";
		li.appendChild(lihtml);
		
		// strong - currRate
		lihtml = document.createElement("strong");
		lihtml.textContent = currRates[id];
		li.appendChild(lihtml);
		
		li.appendChild(document.createElement("br"));
		
		// span.upd - lastUpdate
		lihtml = document.createElement("span");
		lihtml.className = "upd";
		lihtml.dataset.id = id;
		lihtml.textContent = lastUpdate(id);
		li.appendChild(lihtml);
		
		ul.appendChild(li);
	}
	
	if (ul.childNodes.length === 0) {
		resBtn.style.display = "none";
		
		li = document.createElement("li");
		li.textContent = "No downloaded exchange rate yet.";
		
		ul.appendChild(li);
	}
	else {
		resBtn.style.display = "initial";
	}
	
	to = setTimeout(function() {
		addon.port.emit("panelHeight", div.clientHeight);
	}, 200);
}

function lastUpdate(id) {
	var lt;
	
	lt = Date.now() - currRatesLT[id];
	
	if (lt > 3600000) {
		lt = Math.floor(lt / 3600000);
		if (lt === 1) lt = "more than " + lt + " hour";
		else lt = "more than " + lt + " hours";
	}
	else {
		lt = Math.floor(lt / 60000);
		if (lt === 0) lt = "less than a minute";
		else if (lt === 1) lt += " minute";
		else lt += " minutes";
	}
	
	return "(updated " + lt + " ago)";
}