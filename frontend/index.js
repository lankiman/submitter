"use Strict";

//globals
const form = document.querySelector("form");
const fileInput = document.getElementById("file--input");
const selectInput = document.getElementById("select--input");
const selectError = document.getElementById("select--error");
const namingError = document.getElementById("naming--error");
const emptyError = document.getElementById("empty--error");
const dragDrop = document.getElementById("drag-drop");
const chooseFileButton = document.querySelector(".choose-file--button");
const chooseFileIcon = document.getElementById("cloud-upload--icon");
const filesList = document.getElementById("files--list");
const errorList = document.querySelectorAll(".error");
const successStatus = document.getElementById("success--container");
const failStatus = document.getElementById("fail--container");
const statusContainer = document.getElementById("status--container");
const loadingOverlay = document.querySelector(".loading--overlay");
const percentDetails = document.querySelector(".details--container");
const progressBar = document.querySelector(".loading--progress");
const uploadedFilesDetails = document.querySelector(
  ".uploaded--details--container"
);
const hostname = window.location.hostname;

const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+(?:_[A-Za-z]+)?_[1-9]\.(py|mp4)$/;

let selectedFiles = [];

//drag and drop functionality
dragDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dragDrop.addEventListener("drop", (e) => {
  e.preventDefault();

  for (let file of e.dataTransfer.files) {
    const fileType = file.type;
    if (fileType !== "text/x-python" && fileType !== "video/mp4") {
      alert("Only Python (.py) and MP4 files are allowed.");
      return;
    }
  }

  fileInput.files = e.dataTransfer.files;
  fileInput.dispatchEvent(new Event("change"));
});

//custom input functionality
chooseFileButton.addEventListener("click", () => {
  fileInput.click();
});
chooseFileIcon.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const files = fileInput.files;
  emptyError.style.display = "none";
  namingError.style.display = "none";

  for (let inputFile of files) {
    const fileIndex = selectedFiles.findIndex(
      (file) => file.name === inputFile.name
    );

    if (fileIndex !== -1) {
      selectedFiles.splice(fileIndex, 1, inputFile);
    } else {
      selectedFiles.push(inputFile);

      const li = document.createElement("li");
      li.innerHTML = `
    <p class="file--name">${inputFile.name}</p>
    <button class="del--button" type="button">
      <svg
        data-slot="icon"
        fill="none"
        stroke-width="1.5"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        ></path>
      </svg></button
    >`;
      filesList.appendChild(li);
    }
  }

  let delButton = document.querySelectorAll(".del--button");
  delButton.forEach((button) => {
    button.addEventListener("click", () => {
      const listItem = button.parentElement;
      const fileName = listItem.querySelector(".file--name").textContent;
      const fileIndex = selectedFiles.findIndex(
        (file) => file.name === fileName
      );
      if (fileIndex !== -1) {
        selectedFiles.splice(fileIndex, 1);
        listItem.remove();
      }
    });
  });
});

selectInput.addEventListener("change", () => {
  if (selectInput.value != "") {
    selectError.style.display = "none";
    selectInput.style.borderColor = "initial";
  }
});

//loading status display function

function failDisplay() {
  loadingOverlay.style.display = "none";
  statusContainer.style.display = "flex";
  failStatus.style.display = "flex";
  failStatus.addEventListener("animationend", () => {
    failStatus.style.display = "none";
    statusContainer.style.display = "none";
  });
}

function successDisplay() {
  loadingOverlay.style.display = "none";
  statusContainer.style.display = "flex";
  successStatus.style.display = "flex";
  filesList.replaceChildren();
  selectedFiles.splice(0);
  form.reset();
  successStatus.addEventListener("animationend", () => {
    successStatus.style.display = "none";
    statusContainer.style.display = "none";
  });
}

// Axios Config

let uploadedFiles = 0;
let fileProgress = {};
let currentSize = 0;
let fileTracker = {};
let totalFileSize = 0;

//unit conversion funtions
const sizeConverter = (size) => {
  let units = ["bytes", "kb", "mb", "gb"];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const config = {
  onUploadProgress: function (progressEvent) {
    fileProgress[fileTracker.name] =
      (progressEvent.loaded * 100) / progressEvent.total;

    currentSize = progressEvent.loaded;

    let totalSize = sizeConverter(totalFileSize);
    // sum up all file progress percentages to calculate the overall progress
    const totalPercent = fileProgress
      ? Object.values(fileProgress).reduce((sum, num) => sum + num, 0)
      : 0;
    // divide the total percentage by the number of files
    let percentCompleted = parseInt(
      Math.round(totalPercent / selectedFiles.length)
    );

    progressBar.setAttribute("value", percentCompleted);

    percentDetails.firstChild.textContent = `${Math.round(
      percentCompleted
    )}% uploaded`;

    percentDetails.lastChild.textContent = `${sizeConverter(
      progressEvent.rate || 0
    )}/s`;

    uploadedFilesDetails.firstChild.textContent = `${uploadedFiles} of ${selectedFiles.length} files uploaded`;

    uploadedFilesDetails.children[1].textContent = `${sizeConverter(
      currentSize
    )} of ${totalSize} Uploaded`;

    // uploadedFilesDetails.lastChild.textContent = `${Math.ceil(
    //   progressEvent.estimated
    // )} seconds remaning`;
  }
};
//generic submsion function
const submitFile = async (url, dept, files) => {
  uploadedFiles = 0;
  fileProgress = {};
  currentSize = 0;
  loadingOverlay.style.display = "flex";
  const formData = new FormData();
  totalFileSize = files.reduce((total, file) => total + file.size, 0);

  for (let file of files) {
    formData.append(`file`, file);
    fileTracker = file;
    try {
      const response = await axios.post(url + `${dept}`, formData, config);
      if (response.data.message == "upload successful") {
        uploadedFiles++;
      }
    } catch (error) {
      failDisplay();
    }
  }
  if (uploadedFiles == files.length) {
    successDisplay();
  }
};

//form submision and validation
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const submissionUrl = `http://${hostname}:3000/api/submit/`;
  let isValid = true;
  let failedFiles = [];
  namingError.style.display = "none";

  if (selectInput.value == "") {
    selectError.style.display = "block";
    selectInput.style.borderColor = "red";
    alert("Please Choose a Department");
    selectInput.scrollIntoView({ behavior: "smooth", block: "start" });
    isValid = false;
  }

  if (selectedFiles.length == 0) {
    emptyError.style.display = "block";
    isValid = false;
  }

  if (selectedFiles.length > 0) {
    failedFiles = selectedFiles
      .filter((file) => !namePattern.test(file.name))
      .map((file) => file.name);

    if (failedFiles.length > 0) {
      namingError.style.display = "block";
      alert(
        `Please Check the following files and name them properly:\n${failedFiles.join(
          "\n"
        )}\nThey are highlighted below`
      );
      isValid = false;
    }
  }
  // Accessing parent elements of list items
  const listItems = filesList.querySelectorAll("li");
  listItems.forEach((listItem) => {
    const fileElement = listItem.querySelector(".file--name");
    const fileButton = listItem.querySelector("button");
    if (fileElement) {
      const fileName = fileElement.textContent;
      if (failedFiles.includes(fileName)) {
        listItem.style.backgroundColor = "red";

        fileElement.style.color = "white";
        fileButton.style.color = "white";
      }
    }
  });

  if (isValid) {
    // selectedFiles.forEach((file) => {
    //   formData.append(`file`, file);
    // });
    submitFile(submissionUrl, selectInput.value, selectedFiles);
  }
});
