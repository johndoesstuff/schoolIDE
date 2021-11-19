window.themes = [
	"ambiance",
	"chaos",
	"chrome",
	"clouds",
	"clouds_midnight",
	"cobalt",
	"crimson_editor",
	"dawn",
	"dracula",
	"dreamweaver",
	"eclipse",
	"github",
	"gob",
	"gruvbox",
	"idle_fingers",
	"iplastic",
	"katzenmilch",
	"kr_theme",
	"kuroir",
	"merbivore",
	"merbivore_soft",
	"monokai",
	"mono_industrial",
	"nord_dark",
	"pastel_on_dark",
	"solarized_dark",
	"solarized_light",
	"sqlserver",
	"terminal",
	"textmate",
	"tomorrow",
	"tomorrow_night",
	"tomorrow_night_blue",
	"tomorrow_night_bright",
	"tomorrow_night_eighties",
	"twilight",
	"vibrant_ink",
	"xcode",
]

window.theme = 0;
setTheme(0);

/*console.log = (e) => {
	var log = document.createElement("div");
	log.innerText = e;
	log.classList.add("log");
	document.getElementById("terminal").appendChild(log)
}*/

window.onmessage = (e) => {
	e = e.data;
	var text = e.substr(1);
	var type = e[0];
	var log = document.createElement("div");
	log.innerText = text;
	log.classList.add("log");
	if (type == "e") log.classList.add("error");
	if (type == "d") cls();
	if (type == "r") log.classList.add("return");
	document.getElementById("terminal").insertBefore(log, document.getElementById("terminalInput"))
}

function setTheme(e) {
	window.theme = e;
	editor.setTheme("ace/theme/" + window.themes[e]);
	document.getElementById("currentTheme").value = e;
}

document.getElementById("currentTheme").onkeydown = (e) => {if (e.key == "Enter") setTheme(Number(document.getElementById("currentTheme").value))}

function nextTheme() {
	window.theme++;
	window.theme %= window.themes.length;
	setTheme(window.theme);
}

function previousTheme() {
	window.theme += window.themes.length-1;
	window.theme %= window.themes.length;
	setTheme(window.theme);
}

/*var blob = new Blob([files[1][1]], {type : 'application/javscript'});
var blobURI = URL.createObjectURL(blob);
document.getElementById("frame").contentWindow.document.write(files.filter(e => e[0] == "index.html")[0][1].split("script.js").join(blobURI))*/


window.onbeforeunload = e => "";
document.getElementById("terminal").onclick = () => {
	document.getElementById("terminalInput").focus();
}
document.getElementById("terminalInput").onkeydown = (e) => {
	if (e.key == "Enter") {
		document.getElementById("frame").contentWindow.postMessage(document.getElementById("terminalInput").innerText);
		document.getElementById("terminalInput").innerText = "";
		e.preventDefault();
	}
}

function run() {
	if (!isNaN(currentFile)) files[currentFile][1] = editor.getValue();
	updateFiles();
	document.getElementById("frame").parentNode.replaceChild(document.getElementById("frame").cloneNode(), document.getElementById("frame"));
	var index = files.filter(e => e[0] == "index.html")[0][1];
	var otherFiles = files.filter(e => e[0] != "index.html");
	for (var i = 0; i < otherFiles.length; i++) {
		var blob = new Blob([otherFiles[i][1]]);
		var blobURI = URL.createObjectURL(blob);
		index = index.split(otherFiles[i][0]).join(blobURI);
	}
	document.getElementById("frame").contentWindow.document.write(index);
}

function expand() {
	if (!isNaN(currentFile)) files[currentFile][1] = editor.getValue();
	updateFiles();
	var newWindow = window.open('...');
	var index = files.filter(e => e[0] == "index.html")[0][1];
	var otherFiles = files.filter(e => e[0] != "index.html");
	for (var i = 0; i < otherFiles.length; i++) {
		var blob = new Blob([otherFiles[i][1]]);
		var blobURI = URL.createObjectURL(blob);
		index = index.split(otherFiles[i][0]).join(blobURI);
	}
	newWindow.document.write(index);
}

function updateFiles() {
	while (document.getElementById("files").lastChild) {
        document.getElementById("files").removeChild(document.getElementById("files").lastChild);
    }
	for (var i = 0; i < files.length; i++) {
		var fileName = document.createElement("input")
		fileName.classList.add("txtInp");
		fileName.classList.add("fileName");
		fileName.value = files[i][0];
		fileName.fileId = i;
		fileName.onchange = (e) => {
			e.target.blur();
			renameFile(e.target.fileId, e.target.value)
		}
		var file = document.createElement("div");
		file.classList.add("file");
		var fileBtn = document.createElement("div");
		fileBtn.classList.add("btn");
		fileBtn.classList.add("fileBtn");
		fileBtn.innerText = ">>";
		fileBtn.fileId = i;
		fileBtn.onclick = (e) => {
			loadFile(e.target.fileId);
		}
		fileBtn.title = "Go to File";
		var fileDel = document.createElement("div");
		fileDel.classList.add("btn");
		fileDel.classList.add("fileBtn");
		fileDel.innerText = "x";
		fileDel.fileId = i;
		fileDel.onclick = (e) => {
			delFile(e.target.fileId);
		}
		fileDel.title = "Delete File";
		file.appendChild(fileBtn)
		file.appendChild(fileDel)
		file.appendChild(fileName)
		document.getElementById("files").appendChild(file);
	}
}

function renameFile(e, name) {
	console.log(e, name);
	files[Number(e)][0] = name;
}

function create() {
	files.push(["newFile", ""]);
	updateFiles();
}

function loadFile(e) {
	if (!isNaN(currentFile) && files[currentFile]) files[currentFile][1] = editor.getValue();
	currentFile = e;
	editor.setValue(files[e][1], 1)
	editor.setOption("mode", "ace/mode/" + (({
		"js" : "javascript",
		"html" : "html",
		"css" : "css",
	})[files[e][0].split(".")[files[e][0].split(".").length-1]] || "plain_text"));
}

function delFile(e) {
	if (confirm("Are you sure you want to delete " + files[e][0] + "?")) files.splice(e, 1);
	updateFiles();
}

function cls() {
	Array.from(document.getElementById("terminal").children).filter(e => e.id != "terminalInput").map(e => e.parentNode.removeChild(e));
}

function downloadproject() {
	var zip = new JSZip();
	for (var i = 0; i < files.length; i++) {
		zip.file(files[i][0], files[i][1]);
		
	}
	zip.generateAsync({type: "blob"}).then(e => {
		var a = document.createElement("a");
		a.href = URL.createObjectURL(e);
		a.download = "society";
		a.click();
	})
}

window.files = [
	["index.html", `<!DOCTYPE html>
<html>
	<head>
		<script src="__consoleHandler.js"></script>
		<title>John is cool</title>
	</head>
	<body>
		<script src="script.js"></script>
	</body>
</html>`],
	["script.js", `function add(x, y) {
	var resultString = "Example: ";
	var result = x + y;
	return resultString + result;
}

var addResult = add(3, 2);
console.log(addResult);`],
	["__consoleHandler.js", `//dont touch unless you know what youre doing
console.log = (e) => {
	window.top.postMessage("c"+e, '*');
};
window.onerror = (e) => {
	window.top.postMessage("e"+e, '*');
};
console.clear = () => {
	window.top.postMessage("d", '*');
};
window.onmessage = (e) => {
	e = e.data;
	console.log("> " + e);
	window.top.postMessage("r"+JSON.stringify(eval(e), "\\\\n", "\\\\t"), "*");
};
console.clear();`],
]

updateFiles();
window.currentFile = NaN;
loadFile(0);