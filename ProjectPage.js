
// A function to fetch the data file with json data in it

async function FetchData(filePath)
{
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

// A function to get Project Page template html look


async function FetchTemplate(templatePath)
{
    const response = await fetch(templatePath);
    const text = await response.text();
    const template = document.createElement('div');
    template.innerHTML = text;

    return template;
}


// A function to display the data from the json file into the project template page

async function PopulateProjectPage(filePath)
{
    const pageContainer = document.getElementById('project-page-container');
    const template = await FetchTemplate('Project-Page-Template.html');

    console.log("Finding data from: " + filePath);

    const pageData = await FetchData('demon-spawn.txt');

    console.log("Final try for day Page title: " + pageData.title);
    console.log("Demon Page Content: " + pageData.content);

    const clone = template.cloneNode(true);
    clone.innerHTML = clone.innerHTML
        .replace('{{title}}', pageData.title || 'Title not found')
        .replace('{{content}}', pageData.content || 'Content not found');

    if (pageData.videoTitle && pageData.videoUrl) {
        clone.innerHTML = clone.innerHTML
            .replace('{{videoTitle}}', pageData.videoTitle)
            .replace('{{videoUrl}}', pageData.videoUrl);
    } else {
        const videoTitleElement = clone.querySelector('.video-title');
        const videoElement = clone.querySelector('.video-iframe');
        if (videoTitleElement) videoTitleElement.remove();
        if (videoElement) videoElement.remove();
    }

    if (pageData.pageLink) {
        clone.innerHTML = clone.innerHTML
            .replace('{{pageLink}}', pageData.pageLink);
    } else {
        const pageLinkElement = clone.querySelector('.page-link');
        if (pageLinkElement) pageLinkElement.remove();
    }

    console.log("Populated template:", clone.innerHTML); 
    pageContainer.appendChild(clone);
}

//Test function

async function TestFunction(testMessage)
{
    console.log(testMessage);
}


document.addEventListener('DOMContentLoaded', () => {
    const filePath = 'demon-spawn.txt';
    PopulateProjectPage(filePath);
});