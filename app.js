// Global selections
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll("input[type='range']");
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy_container");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close_adjustment");
const slidersContainers = document.querySelectorAll(".sliders");
let initialColors;
//for local storage
let savedPalettes = [];

//event listeners
generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("input", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});
lockBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    toggleLockButton(index);
  });
});

//functions
//color generator
function randomColors() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = chroma.random();

    //add it to the array
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    //Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //check for contrast
    checkTextContrast(randomColor, hexText);
    //Initial Colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //reset inputs
  resetInputs();
  //check for button contrast
  adjustBtn.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockBtn[index]);
  });
}
function toggleLockButton(index) {
  const div = lockBtn[index].parentElement.parentElement;
  const icon = lockBtn[index].firstChild;
  icon.classList.toggle("fa-lock-open");
  icon.classList.toggle("fa-lock");
  div.classList.toggle("locked");
}
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //scacle saturation
  const noSaturation = color.set("hsl.s", 0);
  const fullSaturation = color.set("hsl.s", 1);
  const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]); //making palette
  //Scale brightness
  const midBrightness = color.set("hsl.l", 0.5);
  const scaleBrightness = chroma.scale(["black", midBrightness, "white"]);

  //Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSaturation(
    0
  )}, ${scaleSaturation(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBrightness(
    0
  )}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(255, 0, 0), rgb(255,255 ,0),rgb(0, 255, 0),rgb(0, 255, 255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0))`;
}
function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  //colorize inputs/sliders
  colorizeSliders(color, hue, brightness, saturation);
}
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex(); //convert to hex
  //check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}
function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2].toFixed(2);
      slider.value = brightValue;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1].toFixed(2);
      slider.value = satValue;
    }
  });
}
function copyToClipboard(hex) {
  navigator.clipboard.writeText(hex.innerText);
  //Pop up animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
function openAdjustmentPanel(index) {
  slidersContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  slidersContainers[index].classList.remove("active");
}
//implement Save to palette and local storage
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit_save");
const closeSave = document.querySelector(".close_save");
const saveContainer = document.querySelector(".save_container");
const saveInput = document.querySelector(".save_container input");
const libraryContainer = document.querySelector(".library_container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close_library");

//event listeners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}
function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  //generate object
  let paletteNr = savedPalettes.length;
  const paletteObj = { name: name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  //save to local storage
  savetoLocal(paletteObj);
  saveInput.value = "";
  //gerate the palette for library
  const palette = document.createElement("div");
  palette.classList.add("custom_palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small_preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick_palette_btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  const paletteDeleteBtn = document.createElement("button");
  paletteDeleteBtn.classList.add("delete_palette");
  paletteDeleteBtn.classList.add(paletteObj.nr);
  paletteDeleteBtn.innerHTML = "<i class='fas fa-trash'></i>";

  //attach event to the button
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });
  paletteDeleteBtn.addEventListener("click", (e) => {
    const index = e.target.classList[1];
    deletePalette(e, index);
  });

  function deletePalette(e, index) {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    paletteObjects.forEach((palette) => {
      if (palette.name === e.target.parentElement.children[0].innerText) {
        paletteObjects.splice(index, 1);
      }
    });
    updatedPalettes = JSON.stringify(paletteObjects);
    localStorage.setItem("palettes", updatedPalettes);
    e.target.parentElement.remove();
  }

  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  palette.appendChild(paletteDeleteBtn);
  libraryContainer.children[0].appendChild(palette);
}
function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}
function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localStorage = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    //regenerate all palettes
    paletteObjects.forEach((paletteObj) => {
      //gerate the palette for library
      const palette = document.createElement("div");
      palette.classList.add("custom_palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small_preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick_palette_btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";
      const paletteDeleteBtn = document.createElement("button");
      paletteDeleteBtn.classList.add("delete_palette");
      paletteDeleteBtn.classList.add(paletteObj.nr);
      paletteDeleteBtn.innerHTML = "<i class='fas fa-trash'></i>";

      //attach event to the button
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      paletteDeleteBtn.addEventListener("click", (e) => {
        const index = e.target.classList[1];
        deletePalette(e, index);
      });
      function deletePalette(e, index) {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        let i = 0;
        paletteObjects.forEach((palette) => {
          if (palette.name === e.target.parentElement.children[0].innerText) {
            paletteObjects.splice(i, 1);
          }
        });
        updatedPalettes = JSON.stringify(paletteObjects);
        localStorage.setItem("palettes", updatedPalettes);
        e.target.parentElement.remove();
      }

      //append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      palette.appendChild(paletteDeleteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

getLocal();
randomColors();
