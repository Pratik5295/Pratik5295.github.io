
// Function to fetch the template from an external file
async function fetchTemplate(templatePath) {
    const response = await fetch(templatePath);
    const text = await response.text();
    const template = document.createElement('div');
    template.innerHTML = text;
    return template;
}

async function fetchDataFromFile(filePath) {
    const response = await fetch(filePath);
    const text = await response.text();
    const data = JSON.parse(text);
    return data.map(item => ({
        title: item.title.trim(),
        content: item.content.trim(),
        videoTitle: item.videoTitle.trim(),
        videoUrl: item.videoUrl.trim()
    }));
}

async function fetchDataFromMultipleFiles(filePaths) {
    const allData = [];
    for (const filePath of filePaths) {
        const data = await fetchDataFromFile(filePath);
        allData.push(...data);
    }
    return allData;
}


// Function to initialize the grid with fetched data
async function fetchDataAndFillGrid() {
    console.log("Fetching data and filling grid...");
    const gridContainer = document.getElementById('grid-container');
    const template = await fetchTemplate('project-template.html');

    const filePaths = ['tower-defense.txt','demon-spawn.txt']; // List of text file paths containing JSON
    const data = await fetchDataFromMultipleFiles(filePaths);

    data.forEach(item => {
        const clone = template.cloneNode(true);
        clone.innerHTML = clone.innerHTML
            .replace('{{title}}', item.title)
            .replace('{{content}}', item.content)
            .replace('{{videoTitle}}', item.videoTitle)
            .replace('{{videoUrl}}', item.videoUrl);
        gridContainer.appendChild(clone);
    });
}

function initializeGrid() {
    console.log("Initializing grid...");
    // Grid initialization code here if needed
}


// Initialize the grid and set up event listeners
document.addEventListener("DOMContentLoaded", () => {
    initializeGrid();
    fetchDataAndFillGrid();
});

