
// Function to fetch the template from an external file
async function fetchTemplate(templatePath) {
    console.log(templatePath);
    const response = await fetch(templatePath);
    const text = await response.text();
    const template = document.createElement('div');
    template.innerHTML = text;
    return template;
}

async function fetchDataFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${filePath}`);
        }
        const text = await response.text();
        const data = JSON.parse(text);
        return [data]; // Wrap the parsed data in an array (assuming each file contains one JSON object)
    } 
    catch (error) 
    {
        console.error('Error fetching or parsing data:', error);
        return []; // Return empty array or handle error gracefully
    }
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
    console.log("New grid fetching..");
    const gridContainer = document.getElementById('grid-container');
    const template = await fetchTemplate('ProjectTemplate.html');

    const filePaths = ['tower-defense.txt','demon-spawn.txt']; // List of text file paths containing JSON
    const data = await fetchDataFromMultipleFiles(filePaths);

    data.forEach(item => {
        const clone = template.cloneNode(true);
        clone.innerHTML = clone.innerHTML
            .replace('{{title}}', item.title)
            .replace('{{content}}', item.content)
            .replace('{{videoTitle}}', item.videoTitle)
            .replace('{{videoUrl}}', item.videoUrl)
            .replace('{{pageName}}',item.pageName);
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

