
async function fetchTemplate() 
{
const response = await fetch('ProjectTemplate.html');
return response.text();
}

async function loadContent(file) 
{
try {
    const response = await fetch(file);
    const data = await response.json();

    const template = await fetchTemplate();
   
    return template;

} catch (error) {
    console.error('Error loading content:', error);
}
}

async function LoadMultipleFiles(filepaths)
{
    const allData = [];

    for(const filepath in filepaths)
        {
            const data = await loadContent(filepath);
            allData.push(...data);
        }

        return allData;
}

async function fetchDataAndFillGrid() 
{
    console.log("Fetching data and filling grid...");
    const gridContainer = document.getElementById('grid-container');
    const template =  await fetchTemplate();

    const filePaths = ['tower-defense.txt','demon-spawn.txt'];
    const data = await LoadMultipleFiles(filePaths);

    data.forEach(item => {
        const constructedPage = template
        .replace('{{title}}', item.title)
        .replace('{{content}}', item.content)
        .replace('{{videoTitle}}',item.videoTitle)
        .replace('{{videoUrl}}',item.videoUrl);
        gridContainer.appendChild(constructedPages);
    });
}

window.onload = () =>
{
    fetchDataAndFillGrid();
};
