
// A function to fetch the data file with json data in it

async function FetchData(filePath)
{
    const response = await fetch(filePath);
    const responseText = await response.text();

    const data = JSON.parse(responseText);
    return [data];
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
    const pageContainer = document.getElementById("project-page-container");
    const template = await FetchTemplate("Project-Page-Template.html");

    console.log("Finding data from: " + filePath);

    const pageData = await FetchData(filePath);

    console.log("Page title: " + pageData.title);
    console.log("Page Content: " + pageData.content);

    const clone = template.cloneNode(true);
    clone.innerHTML = clone.innerHTML
        .replace('{{title}}',pageData.title)
        .replace('{{content}}',pageData.content);

    pageContainer.appendChild(clone);
}

//Test function

async function TestFunction(testMessage)
{
    console.log(testMessage);
}