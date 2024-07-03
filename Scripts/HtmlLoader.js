async function LoadPage(path,id)
{
    const response = await fetch(path);
    const text = await response.text();
    document.getElementById(id).innerHTML = text;
    console.log("Loaded page: " + path);
}

