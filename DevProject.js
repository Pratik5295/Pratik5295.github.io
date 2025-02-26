
// Function to fetch the template from an external file
async function fetchTemplate(templatePath) {
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
        const newPath = "./Data/" + filePath;
        const data = await fetchDataFromFile(newPath);
        allData.push(...data);
    }
    return allData;
}


// Function to initialize the grid with fetched data
async function fetchDataAndFillGrid() {
    const gridContainer = document.getElementById('grid-container');
    const template = await fetchTemplate('Homepage-Project-Template.html');

    const filePaths = ['arshooter.json','slurpcore.txt','tower-defense.txt','demon-spawn.txt','tiletool.txt','cube-craft.txt','drinkology.txt','mapbox-nav.txt','fruitfall.txt','pinball.txt']; // List of text file paths containing JSON
    const data = await fetchDataFromMultipleFiles(filePaths);

    data.forEach(item => {
        const clone = template.cloneNode(true);
        clone.innerHTML = clone.innerHTML
            .replace('{{imageUrl}}',item.imageUrl)
            .replace('{{title}}', item.title)
            .replace('{{content}}', item.content)
            .replace('{{videoTitle}}', item.videoTitle)
            .replace('{{videoUrl}}', item.videoUrl)
            .replace('{{pageLink}}',item.pageLink)
            .replace('{{fromTitleLink}}',item.pageLink)
            .replace('{{gameEngine}}',item.gameEngine);
            gridContainer.appendChild(clone);
    });

    const recentGridContainer = document.getElementById('recent-projects-grid');
    const recentfilePaths = ['dialogueTool.json','detective.txt','devstory.json'];
    const recentData = await fetchDataFromMultipleFiles(recentfilePaths);

    recentData.forEach(item => {
        const clone = template.cloneNode(true);
        clone.innerHTML = clone.innerHTML
            .replace('{{imageUrl}}',item.imageUrl)
            .replace('{{title}}', item.title)
            .replace('{{content}}', item.content)
            .replace('{{videoTitle}}', item.videoTitle)
            .replace('{{videoUrl}}', item.videoUrl)
            .replace('{{pageLink}}',item.pageLink)
            .replace('{{fromTitleLink}}',item.pageLink)
            .replace('{{gameEngine}}',item.gameEngine);
            recentGridContainer.appendChild(clone);
    });

}



function initializeGrid() {
    // Grid initialization code here if needed
}


// Initialize the grid and set up event listeners
document.addEventListener("DOMContentLoaded", () => {
    initializeGrid();
    fetchDataAndFillGrid();

});

