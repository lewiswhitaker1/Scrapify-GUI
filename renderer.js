const { ipcRenderer } = require('electron');
const AnsiToHtml = require('ansi-to-html');
const ansiToHtml = new AnsiToHtml();

let folderPath = '';

document.getElementById('confirm-button').addEventListener('click', () => {
    const link = document.getElementById('spotify-link').value;
    ipcRenderer.send('run-exe', link);
});

document.getElementById('open-folder-button').addEventListener('click', () => {
    ipcRenderer.send('open-folder');
});

ipcRenderer.on('exe-output', (event, data) => {
    const output = document.getElementById('output');

    const htmlData = ansiToHtml.toHtml(data);
    output.innerHTML += htmlData;

    output.scrollTop = output.scrollHeight;

    const cleanedData = data.replace(/\x1b\[[0-9;]*m/g, '');
    const match = cleanedData.match(/Successfully wrote track data to (.+?)(\r?\n|$)/);
    if (match) {
        folderPath = match[1].replace(/\\[^\\]*$/, '');
        ipcRenderer.send('set-folder-path', folderPath);
    }
});
