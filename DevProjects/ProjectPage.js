
// A function to fetch the data file with json data in it

function FetchData(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data from ${filePath}`);
            }
            return response.text();
        })
        .then(text => {
            return JSON.parse(text);
        })
        .then(data => {
            return [data]; // Wrap the parsed data in an array (assuming each file contains one JSON object)
        })
        .catch(error => {
            console.error('Error fetching or parsing data:', error);
            return []; // Return empty array or handle error gracefully
        });
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
    const pageHeader = document.getElementById('project-page-header');
    const pageContainer = document.getElementById('project-page-container');
    const template = await FetchTemplate('Project-Page-Template.html');

    const pageData = FetchData(filePath);


    const projectData = (await pageData)[0];
    
    const clone = template.cloneNode(true);
    clone.innerHTML = clone.innerHTML
        .replace('{{title}}', projectData.title || 'Title not found')
        .replace('{{description}}', projectData.description || 'Content not found');

    pageContainer.appendChild(clone);

    pageHeader.innerHTML = projectData.title;
}
