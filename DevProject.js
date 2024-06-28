
async function fetchTemplate() 
{
    const response = await fetch('ProjectTemplate.html');
    const text = await response.text();
    const template = document.createElement('div');
    template.innerHTML = text;
    return template;
}

async function loadContent(file) 
{
try {
    const response = await fetch(file);
    const data = await response.json();
   
    return data;

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
        const clone = template.cloneNode(true);
        clone.querySelector('title').textContent = item.title;
        clone.querySelector('content').textContent = item.content;
        clone.querySelector('videoTitle').textContent = item.videoTitle;
        clone.querySelector('videoUrl').textContent = item.videoUrl;
        gridContainer.appendChild(clone);
    });
}

window.onload = () =>
{
    fetchDataAndFillGrid();
};
