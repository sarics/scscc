"use strict";

var currRates, currReqs, uPrefs;

var css = 
	"data.scscc {\n\
		padding: 0 2px !important;\n\
		color: inherit !important;\n\
		white-space: pre !important;\n\
		border-width: 0 1px !important;\n\
		border-style: dotted !important;\n\
		border-color: inherit !important;\n\
		cursor: help !important;\n\
	}\n\
	data.scscc:hover {\n\
		background-color: red !important;\n\
		color: white !important;\n\
	}";
var style = document.createElement("style");
style.innerHTML = css;

var patt = {
	EUR: [ 
		/(€|eur(os|o)?)\s?(((\d{1,3}((\,|\.|\s)\d{3})+|(\d+))((\.|\,)\d{1,9})?)|(\.\d{1,9}))/ig,
		/(((\d{1,3}((\,|\.|\s)\d{3})+|(\d+))((\.|\,)\d{1,9})?)|(\.\d{1,9}))(,--)?\s?(€|eur(os|o)?)/ig
	],
	USD: [
		/(\$|usd)\s?(((\d{1,3}((\,|\.|\s)\d{3})+|(\d+))((\.|\,)\d{1,9})?)|(\.\d{1,9}))/ig,
		/(((\d{1,3}((\,|\.|\s)\d{3})+|(\d+))((\.|\,)\d{1,9})?)|(\.\d{1,9}))(,--)?\s?(\$|usd)/ig
	],
	GBP: [
		/(£|gbp)\s?(((\d{1,3}((\,|\.|\s)\d{3})+|(\d+))((\.|\,)\d{1,9})?)|(\.\d{1,9}))/ig,
		/(((\d{1,3}((\,|\.|\s)\d{3})+|(\d+))((\.|\,)\d{1,9})?)|(\.\d{1,9}))(,--)?\s?(£|gbp)/ig
	]
};

var observer = new MutationObserver(function(mutlist) {
	checkMutations(mutlist);
});




self.port.once("firstRun", function(data) {
	uPrefs = data[0];
	currRates = data[1];
	currReqs = {};
	
	if (uPrefs.btn) replaceAllElems();
});

self.port.on("refreshUPrefs", function(data) {
	var changed = false;
	
	for (var id in data) {
		if (!uPrefs.hasOwnProperty(id) || uPrefs[id] !== data[id]) {
			changed = true;
			uPrefs = data;
			break;
		}
	}
	
	if (changed) {
		if (uPrefs.btn) revertRefresh(true);
		else revertRefresh(false);
	}
});

self.port.on("refreshCurrRates", function(data) {
	currRates = data;
	currReqs = {};
	
	if (uPrefs.btn) revertRefresh(true);
});

self.on("detach", function() {
	setTimeout(function() { revertRefresh(false); }, 1000);
});




function replaceAllElems() {
	// start the observer
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	
	getTextNodesIn(document.body, false);
	
	// add the custom style
	if (uPrefs.style) document.head.appendChild(style);
}

// reverts all the changes made by scscc
// if refresh is true, refreshes the page
function revertRefresh(refresh) {
	var replace, data;
	
	// catch: Permission denied to access property 'document'
	try { document; }
	catch (err) {
		console.log("SCsCC - refresh error: " + err.message);
		return;
	}
	
	// remove style from head
	for (var i = document.head.childNodes.length - 1; i >= 0; i--) {
		if (document.head.childNodes[i] === style) {
			document.head.removeChild(style);
			break;
		}
	}
	
	observer.disconnect();
	
	// find and refresh/revert already converted prices
	data = document.querySelectorAll("data.scscc");
	for (var i = 0, len = data.length; i < len; i++) {
		if (refresh && checkCurrRate(data[i].dataset.curr)) {
			replace = parseFloat(data[i].value) * currRates[data[i].dataset.curr + "to" + uPrefs.toCurr];
			replace = formatPrice(replace);
			replace = document.createTextNode(replace);
			data[i].replaceChild(replace, data[i].firstChild);
		}
		else {
			replace = document.createTextNode(data[i].title);
			data[i].parentNode.replaceChild(replace, data[i]);
		}
	}
	
	if (refresh) replaceAllElems();
}

function checkMutations(mutlist) {
	for (var i in mutlist) {
		// only check childList add mutations
		if (mutlist[i].addedNodes.length === 0) continue;
		
		for (var j = 0, len = mutlist[i].addedNodes.length; j < len; j++) {
			getTextNodesIn(mutlist[i].addedNodes[j], true);
		}
	}
}

// get all text nodes of a given node
// from http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
function getTextNodesIn(node, mutation) {
	var textNodes = [];
	var nonWhitespaceMatcher = /\S{2,}/;
	
	function getTextNodes(node) {
		if (node.nodeName === "SCRIPT" || node.nodeName === "STYLE" || node.className === "scscc") return;
		
		if (node.nodeType === 3) {
			if (nonWhitespaceMatcher.test(node.nodeValue)) {
				textNodes.push(node);
			}
		}
		else {
			for (var i = 0, len = node.childNodes.length; i < len; i++) {
				getTextNodes(node.childNodes[i]);
			}
		}
	};
	
	getTextNodes(node);
	
	if (textNodes.length > 0) findMatches(textNodes, mutation);
}

// check if there is any pattern match in a text node and return the matches
function findMatches(textNodes, mutation) {
	var found, m, matches, txt;
	
	for (var i = 0, len = textNodes.length; i < len; i++) {
		found = false;
		matches = {};
		txt = textNodes[i].nodeValue;
		
		for (var from in patt) {
			if (from === uPrefs.toCurr) continue;
			
			for (var j in patt[from]) {
				m = txt.match(patt[from][j]);
				
				if (m) {
					if (!matches.hasOwnProperty(from)) matches[from] = [];
					matches[from] = matches[from].concat(m);
					
					found = true;
				}
			}
		}
		
		if (found) replaceNode(textNodes[i], matches, mutation);
	}
}

// replace the text node with the html text
function replaceNode(node, matches, mutation) {
	var replace;
	
	if (!node.parentNode) return;
	
	replace = document.createElement("div");
	replace.innerHTML = replaceTxt(node.nodeValue, matches);
	
	if (mutation) observer.disconnect();
	
	while (replace.firstChild) {
		node.parentNode.insertBefore(replace.firstChild, node);
	}
	
	node.parentNode.removeChild(node);
	
	if (mutation) {
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}
}

// convert and replace all prices in a text
function replaceTxt(txt, matches) {
	var match, repl;
	var values = {};
	
	for (var from in matches) {
		if (!values.hasOwnProperty(from)) values[from] = [];
		
		if (!checkCurrRate(from)) continue;
		
		for (var mid in matches[from]) {
			match = matches[from][mid];
			
			if (txt.trim() !== match) {
				match = checkSpecCases(txt, match, from);
				if (!match) continue;
				if (match !== matches[from][mid]) matches[from][mid] = match;
			}
			
			repl = match;
			
			repl = cleanPrice(repl);
			
			values[from][mid] = repl;
			
			repl = parseFloat(repl) * currRates[from + "to" + uPrefs.toCurr];
			
			repl = formatPrice(repl);
			
			txt = txt.replace(match, "<data" + from + mid + ">" + repl + "</data>");
		}
	}
	
	for (var from in matches) {
		for (var mid in matches[from]) {
			txt = txt.replace("<data" + from + mid + ">", "<data class=\"scscc\" data-curr=\"" + from + "\" value=\"" + values[from][mid] 
					+ "\" title=\"" + matches[from][mid] + "\">");
		}
	}
	
	return txt;
}


function checkCurrRate(from) {
	// check if request sent already
	if (!currReqs.hasOwnProperty(from + "to" + uPrefs.toCurr)) {
		currReqs[from + "to" + uPrefs.toCurr] = true;
		
		self.port.emit("getCurrRates", [ from, uPrefs.toCurr ]);
	}
	
	if (!currRates.hasOwnProperty(from + "to" + uPrefs.toCurr)) return false;
	return true;
}


function checkSpecCases(txt, match, from) {
	var chckchar;
	var charind = txt.indexOf(match);
	
	// skip other dollars
	//Australian (A$)
	//Barbadian (Bds$)
	//Belizean (BZ$)
	//Brunei (B$)
	//Canadian (CA$)
	//Cayman Islands (CI$)
	//East Caribbean (EC$)
	//Fiji (FJ$)
	//Guyanese (G$)
	//Hong Kong (HK$)
	//Jamaican (J$)
	//Liberian (L$ or LD$)
	//Namibian (N$)
	//New Zealand (NZ$)
	//Singaporean (S$)
	//Soloman Islands (SI$)
	//Taiwanese (NT$)
	//Trinidad and Tobago (TT$)
	//Tuvaluan (TV$)
	//Zimbabwean (Z$)
	//Chilean (CLP$)
	//Colombian (COL$)
	//Dominican (RD$)
	//Mexican (Mex$)
	//Nicaraguan córdoba (C$)
	//Brazilian real (R$)
	if (from === "USD" && match.charAt(0) === "$") {
		chckchar = txt.charAt(charind - 1);
		if (chckchar.search(/\w/) !== -1) {
			txt = txt.slice(0, charind);
			if (txt.search(/(A|Bds|BZ|B|CA|CI|EC|FJ|G|HK|J|L|LD|N|NZ|S|SI|NT|TT|TV|Z|CLP|COL|RD|Mex|C|R)$/) !== -1) return false;
		}
	}
	
	// in case text is like: masseur 1234
	// or
	// in case text is like: 1234 europe
	var sind = match.search(/eur|usd|gbp/i);
	if (sind !== -1) {
		// starts with eur(os)/usd/gbp
		if (sind === 0) {
			// if there is any word character before it, skip it
			chckchar = txt.charAt(charind - 1);
			if (chckchar.search(/\w/) !== -1) return false;
		}
		// ends with eur(os)/usd/gbp
		else {
			// if there is any word character after it, skip it
			chckchar = txt.charAt(charind + match.length);
			if (chckchar.search(/\w/) !== -1) return false;
		}
	}
	
	// in case text is like: somestring1 234 $
	if (match.charAt(0).search(/\d/) !== -1) {
		// if there is a word character before it
		chckchar = txt.charAt(charind - 1);
		if (chckchar.search(/\w/) !== -1) {
			match = match.replace(/^\d+\s/, "");	// convert only 234 $
		}
	}
	
	return match;
}

// make price computer-readable: remove price symbols, and replace/remove separators
function cleanPrice(repl) {
	// remove currency symbols and spaces
	repl = repl.replace(/€|eur(os|o)?|\$|usd|£|gbp|,--|\s/ig, "");
	
	// if no decimal separator
	// remove possible "." or "," thousand separators
	if (repl.search(/(\.|,)\d{1,2}$/) === -1) repl = repl.replace(/\.|,/g, "");
	else {
		// if decimal separator is "."
		// remove possible "," thousand separators
		if (repl.search(/\.\d{1,2}$/) !== -1) repl = repl.replace(/,/g, "");
		// if decimal separptor is ","
		else {
			// remove possible "." thousand separators
			repl = repl.replace(/\./g, "");
			// replace dec separator to "."
			repl = repl.replace(/,/g, ".");
		}
	}
	
	return repl;
}

// format the price according to user prefs
function formatPrice(repl) {
	// set rounding
	repl = (uPrefs.round) ? repl.toFixed(0) : repl.toFixed(2);
	
	// set decimal separator
	if (uPrefs.sepDec !== ".") repl = repl.replace(".", uPrefs.sepDec);
	
	// set thousand separator
	if (uPrefs.sepTho !== "") {
		for (var i = ((uPrefs.round) ? repl.length : repl.indexOf(uPrefs.sepDec)) - 3; i > 0; i -= 3) {
			repl = repl.slice(0, i) + uPrefs.sepTho + repl.slice(i);
		}
	}
	
	// add symbol
	repl = (uPrefs.symbPos === "a") ? repl + ((uPrefs.symbSep) ? " " : "") + uPrefs.symbol : uPrefs.symbol + ((uPrefs.symbSep) ? " " : "") + repl;
	
	return repl;
}