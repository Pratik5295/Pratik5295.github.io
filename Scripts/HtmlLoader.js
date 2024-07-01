async function LoadPage(path,id)
{
    const response = await fetch(path);
    const text = await response.text();
    document.getElementById(id).innerHTML = text;
}

document.addEventListener("DOMContentLoaded", () =>{

    //Load Nav bar
    LoadPage("../Navigation/navbar.html","navbar");
});