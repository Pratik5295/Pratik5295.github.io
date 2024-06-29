
// A function to fetch the data file with json data in it

async function FetchData(filePath)
{
    console.log("Fetching data from" + filePath);
    const response = await fetch(filePath);
    const responseText = await response.text();

    const data = JSON.parse(responseText);
    return [data];
}

// A function to get Project Page template html look


async function FetchTemplate(templatePath)
{
    console.log("Fetching template data" + templatePath);
    const response = await fetch(templatePath);
    const text = await response.text();
    const template = document.createElement('div');
    template.innerHTML = text;

    return template;
}


// A function to display the data from the json file into the project template page

async function PopulateProjectPage()
{
    const pageContainer = document.getElementById("project-page-container");
    const template = await FetchTemplate("Project-Page-Template.html");

    const filePath = "demon-spawn.txt";

    const pageData = await FetchData(filePath);

    const clone = template.cloneNode(true);
    clone.innerHTML = clone.innerHTML
        .replace('{{projectTitle}}',pageData.title)
        .replace('{{description}}',pageData.content);

    pageContainer.appendChild(clone);
}

document.addEventListener("DOMContentLoaded", ()=>
{
    PopulateProjectPage();
});


//Test function

async function TestFunction(testMessage)
{
    console.log(testMessage);
}