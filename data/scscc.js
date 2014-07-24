"use strict";

var scscc = scscc || {};

(function() {
	var uPrefs, currRates;
	var currReqs = {};

	var patt0 = /(((\d{1,3}((\,|\.|\s)\d{3})+|(\d+))((\.|\,)\d{1,9})?)|(\.\d{1,9}))/g;

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

	var symbs = {
		prev: {
			EUR: /(€|eur(os|o)?)$/ig,
			USD: /(\$|usd)$/ig,
			GBP: /(£|gbp)$/ig
		},
		next: {
			EUR: /^(€|eur(os|o)?)/ig,
			USD: /^(\$|usd)/ig,
			GBP: /^(£|gbp)/ig
		}
	};

	var style = document.createElement("style");
	style.textContent =
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

	var observer = new MutationObserver(function(mutlist) {
		checkMutations(mutlist);
	});



	this.set = function(variable, data) {
		switch (variable) {
			case "uPrefs":
				uPrefs = data;
				break;
			case "currRates":
				currRates = data;
				break;
			case "currReqs":
				currReqs = {};
				break;
		}
	};
	
	this.getPrefs = function() {
		return uPrefs;
	};

	this.replaceAllElems = function() {
		// start the observer
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		getTextNodesIn(document.body);

		// add the custom style
		if (uPrefs.style) document.head.appendChild(style);
	};

	// reverts all the changes made by scscc
	// if refresh is true, refreshes the page
	this.revertRefresh = function(refresh) {
		var replace, dataNodes;

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
		dataNodes = document.querySelectorAll("data.scscc");
		for (var i = 0, len = dataNodes.length; i < len; i++) {
			if (refresh && dataNodes[i].dataset.curr !== uPrefs.toCurr && checkCurrRate(dataNodes[i].dataset.curr)) {
				replace = parseFloat(dataNodes[i].value) * currRates[dataNodes[i].dataset.curr + "to" + uPrefs.toCurr];
				replace = formatPrice(replace);
				replace = document.createTextNode(replace);
				dataNodes[i].replaceChild(replace, dataNodes[i].firstChild);
			}
			else {
				replace = document.createTextNode(dataNodes[i].title);
				dataNodes[i].parentNode.replaceChild(replace, dataNodes[i]);
			}
		}

		if (refresh) this.replaceAllElems();
	};


	function checkMutations(mutlist) {
		for (var i in mutlist) {
			// only check childList add mutations
			if (mutlist[i].addedNodes.length === 0) continue;

			for (var j = 0, len = mutlist[i].addedNodes.length; j < len; j++) {
				if (mutlist[i].addedNodes[j].className !== "scscc") getTextNodesIn(mutlist[i].addedNodes[j]);
			}
		}
	}

	// get all text nodes of a given node
	// from http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
	function getTextNodesIn(node) {
		var textNodes = [];
		var ignoreNodes = /^(script|style|pre)$/i;

		function getTextNodes(node) {
			if (node.nodeName.search(ignoreNodes) !== -1 || node.className === "scscc") return;

			if (node.nodeType === 3) {
				if (node.nodeValue.search(patt0) !== -1) {
					textNodes.push(node);
				}
			}
			else {
				for (var i = 0, len = node.childNodes.length; i < len; i++) {
					getTextNodes(node.childNodes[i]);
				}
			}
		}

		getTextNodes(node);

		if (textNodes.length > 0) findMatches(textNodes);
	}

	// check if there is any pattern match in a text node and return the matches
	function findMatches(textNodes) {
		var found, m, matches, txt;

		for (var i = 0, ilen = textNodes.length; i < ilen; i++) {
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

			if (found) replaceNode(textNodes[i], matches);
			else checkSiblings(textNodes[i]);
		}
	}

	// check if currency symbol is in an other node
	function checkSiblings(textNode) {
		var chckSymbs;
		var chckTxt = {};
		var matches = {};
		var txt = textNode.nodeValue;

		var m = txt.match(patt0);
		if (m.length !== 1 || m[0] !== txt.trim()) return;

		// check previous sibling of
		// this node -> check sibling's last child
		if (textNode.previousSibling && textNode.previousSibling.lastChild && textNode.previousSibling.lastChild.nodeType === 3) {
			chckTxt["prev"] = textNode.previousSibling.lastChild.nodeValue.trim();
		}
		// parent node
		else if (textNode.parentNode.previousSibling) {
			// if text node
			if (textNode.parentNode.previousSibling.nodeType === 3) {
				chckTxt["prev"] = textNode.parentNode.previousSibling.nodeValue.trim();
			}
			// if not text node -> check last child
			else if (textNode.parentNode.previousSibling.lastChild && textNode.parentNode.previousSibling.lastChild.nodeType === 3) {
				chckTxt["prev"] = textNode.parentNode.previousSibling.lastChild.nodeValue.trim();
			}
		}

		// check next sibling of
		// this node -> check sibling's first child
		if (textNode.nextSibling && textNode.nextSibling.firstChild && textNode.nextSibling.firstChild.nodeType === 3) {
			chckTxt["next"] = textNode.nextSibling.firstChild.nodeValue.trim();
		}
		// parent node
		else if (textNode.parentNode.nextSibling) {
			// if text node
			if (textNode.parentNode.nextSibling.nodeType === 3) {
				chckTxt["next"] = textNode.parentNode.nextSibling.nodeValue.trim();
			}
			// if not text node -> check first child
			else if (textNode.parentNode.nextSibling.firstChild && textNode.parentNode.nextSibling.firstChild.nodeType === 3) {
				chckTxt["next"] = textNode.parentNode.nextSibling.firstChild.nodeValue.trim();
			}
		}

		for (var pos in chckTxt) {
			chckSymbs = symbs[pos];

			for (var from in chckSymbs) {
				if (from === uPrefs.toCurr) continue;

				if (chckTxt[pos].search(chckSymbs[from]) !== -1) {
					matches[from] = m;

					replaceNode(textNode, matches);
					return;
				}
			}
		}
	}

	// replace the prices in the text node with the converted data nodes
	function replaceNode(node, matches) {
		var matchInd, removeNode, tmpDiv, tmpTxt, txt, txtNode;
		var parentNode = node.parentNode;
		var dataNodes = replaceWith(node.nodeValue, matches);

		for (var i = 0, ilen = dataNodes.length; i < ilen; i++) {
			if (!node.parentNode) return;

			for (var j = 0, jlen = parentNode.childNodes.length; j < jlen; j++) {
				if (parentNode.childNodes[j].nodeType === 3 && parentNode.childNodes[j].nodeValue.indexOf(dataNodes[i].title) !== -1) {
					removeNode = parentNode.childNodes[j];
					txt = removeNode.nodeValue;
					matchInd = txt.indexOf(dataNodes[i].title);
					tmpDiv = document.createElement("div");

					if (matchInd !== 0) {
						tmpTxt = txt.slice(0, matchInd);
						txtNode = document.createTextNode(tmpTxt);
						tmpDiv.appendChild(txtNode);
					}

					tmpDiv.appendChild(dataNodes[i]);

					if (txt.charAt(matchInd + dataNodes[i].title.length) !== "") {
						tmpTxt = txt.slice(matchInd + dataNodes[i].title.length);
						txtNode = document.createTextNode(tmpTxt);
						tmpDiv.appendChild(txtNode);
					}

					while (tmpDiv.firstChild) {
						parentNode.insertBefore(tmpDiv.firstChild, removeNode);
					}
					parentNode.removeChild(removeNode);

					break;
				}
			}
		}
	}

	// find and convert the prices in the text, and return them as data nodes
	function replaceWith(txt, matches) {
		var data, match, repl;
		var dataNodes = [];

		for (var from in matches) {
			if (!checkCurrRate(from)) continue;

			for (var mid in matches[from]) {
				data = document.createElement("data");
				data.className = "scscc";
				data.dataset.curr = from;

				match = matches[from][mid];

				if (txt.trim() !== match) {
					match = checkSpecCases(txt, match, from);
					if (!match) continue;
				}

				repl = match;
				data.title = match;

				repl = cleanPrice(repl);
				data.value = repl;

				repl = parseFloat(repl) * currRates[from + "to" + uPrefs.toCurr];

				repl = formatPrice(repl);
				data.textContent = repl;

				dataNodes.push(data);
			}
		}

		return dataNodes;
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
}).apply(scscc);




self.port.once("firstRun", function(data) {
	scscc.set("uPrefs", data[0]);
	scscc.set("currRates", data[1]);
	
	if (data[0].btn && data[0].toCurr !== "") scscc.replaceAllElems();
});

self.port.on("refreshUPrefs", function(data) {
	var changed = false;
	var prefs = scscc.getPrefs();
	
	for (var id in data) {
		if (!prefs.hasOwnProperty(id) || prefs[id] !== data[id]) {
			changed = true;
			scscc.set("uPrefs", data);
			break;
		}
	}
	
	if (changed) {
		if (data.btn && data.toCurr !== "") scscc.revertRefresh(true);
		else scscc.revertRefresh(false);
	}
});

self.port.on("refreshCurrRates", function(data) {
	var prefs = scscc.getPrefs();
	
	scscc.set("currRates", data);
	scscc.set("currReqs");
	
	if (prefs.btn && prefs.toCurr !== "") scscc.revertRefresh(true);
});

self.port.on("detach", function() {
	setTimeout(function() { scscc.revertRefresh(false); }, 1000);
});