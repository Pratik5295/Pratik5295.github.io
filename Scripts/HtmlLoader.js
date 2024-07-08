var websiteAddress = "https://pratik5295.github.io/PratikGameDev.github.io/";

async function LoadPage(path,id)
{
    fetch(path) // Replace with the path to your HTML page
    .then(response => response.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(error => console.error('Error fetching content:', error));
}

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
