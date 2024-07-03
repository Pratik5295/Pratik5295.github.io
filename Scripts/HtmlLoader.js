async function LoadPage(path,id)
{
    fetch(path) // Replace with the path to your HTML page
    .then(response => response.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    })
    .catch(error => console.error('Error fetching content:', error));
}
