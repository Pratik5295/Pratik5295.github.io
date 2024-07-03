function LoadHomePageArt()
{
    console.log("Loading art grid");
    const leftSection = document.getElementById('artLeftSection');
    const jsonData = [
        {
            "imgSrc": "Images/ProjectData/SSDemonSpawn.jpg",
            "altText": "Image 1"
        },
        {
            "imgSrc": "Images/ProjectData/SSDemonSpawn.jpg",
            "altText": "Image 2"
        },
        {
            "imgSrc": "Images/ProjectData/SSDemonSpawn.jpg",
            "altText": "Image 3"
        },
        {
            "imgSrc": "Images/ProjectData/SSTowerDef.png",
            "altText": "Image 4"
        }
    ];

    const imageGrid = document.createElement('div');
    imageGrid.className = 'image-grid';

    jsonData.forEach(data => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';

        const img = document.createElement('img');
        img.src = data.imgSrc;
        img.alt = data.altText;

        console.log("Loadding grid item image: " + img.src);
        gridItem.appendChild(img);
        imageGrid.appendChild(gridItem);
    });

    leftSection.appendChild(imageGrid);
}

document.addEventListener('DOMContentLoaded', ()=> 
{
    console.log("Art Load event fired");
    LoadHomePageArt();
});
